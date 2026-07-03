import logging
import asyncio
from typing import List
from pydantic import BaseModel, Field
from langchain_ollama import ChatOllama
from langchain_core.prompts import ChatPromptTemplate
from app.config import settings
from app.services.prompt import SYSTEM_PROMPT, USER_TEMPLATE

logger = logging.getLogger(__name__)

class CompatibilityResult(BaseModel):
    compatibility_score: int = Field(description="Adjusted compatibility score between 0 and 100 based on semantic review.")
    summary: str = Field(description="A concise summary of the match suitability.")
    strengths: List[str] = Field(description="List of matching strengths or positive features.")
    missing_preferences: List[str] = Field(description="List of mismatches, missing amenities, or areas of improvement.")
    recommendation: str = Field(description="A final compatibility recommendation.")

class OllamaService:
    def __init__(self):
        try:
            self.llm = ChatOllama(
                base_url=settings.OLLAMA_BASE_URL,
                model=settings.OLLAMA_MODEL,
                temperature=0.0
            )
            # Bind Pydantic model for structured output validation
            self.structured_llm = self.llm.with_structured_output(CompatibilityResult)
            self.active = True
            logger.info("Ollama service initialized successfully.")
        except Exception as e:
            logger.error(f"Failed to initialize ChatOllama model {settings.OLLAMA_MODEL}: {str(e)}")
            self.active = False

    async def get_compatibility(
        self,
        rule_score: int,
        tenant_profile: dict,
        room_listing: dict
    ) -> CompatibilityResult:
        """
        Invokes ChatOllama with the tenant profile and room listing details,
        enforcing a Pydantic schema return. Adjusts baseline rule score by at most +/-5.
        Fallback values are returned if the LLM connection fails or times out.
        """
        if not self.active:
            logger.warning("Ollama service is inactive. Triggering fallback compatibility logic.")
            return self.get_fallback_response(rule_score, tenant_profile, room_listing)

        try:
            prompt = ChatPromptTemplate.from_messages([
                ("system", SYSTEM_PROMPT),
                ("user", USER_TEMPLATE)
            ])

            tenant_preferences_str = ", ".join(tenant_profile.get("preferences", [])) if tenant_profile.get("preferences") else "None"
            room_amenities_str = ", ".join(room_listing.get("amenities", [])) if room_listing.get("amenities") else "None"

            formatted_prompt = prompt.format_messages(
                rule_score=rule_score,
                tenant_location=tenant_profile.get("location", "Not Specified"),
                tenant_preferences=tenant_preferences_str,
                tenant_description=tenant_profile.get("bio", "Not Provided"),
                room_title=room_listing.get("title", "No Title"),
                room_description=room_listing.get("description", "No Description"),
                room_rent=room_listing.get("rent", 0),
                room_location=room_listing.get("location", "Not Specified"),
                room_city=room_listing.get("city", "Not Specified"),
                room_area=room_listing.get("area", "Not Specified"),
                room_amenities=room_amenities_str,
                room_type=room_listing.get("room_type", "Not Specified"),
                room_furnishing=room_listing.get("furnishing", "Not Specified")
            )

            # Invoke ChatOllama with a timeout (5.0 seconds) to prevent service block
            response: CompatibilityResult = await asyncio.wait_for(
                self.structured_llm.ainvoke(formatted_prompt),
                timeout=5.0
            )

            # Enforce constraints: LLM may adjust rule score by at most +/- 5 points
            final_score = int(response.compatibility_score)
            if abs(final_score - rule_score) > 5:
                # Bound adjustment to +/- 5 points
                final_score = rule_score + (5 if final_score > rule_score else -5)

            # Ensure final score remains in the [0, 100] range
            response.compatibility_score = max(0, min(100, final_score))
            return response

        except Exception as e:
            logger.error(f"ChatOllama query or structured parsing failed: {str(e)}. Triggering fallback.")
            return self.get_fallback_response(rule_score, tenant_profile, room_listing)

    def get_fallback_response(
        self,
        rule_score: int,
        tenant_profile: dict,
        room_listing: dict
    ) -> CompatibilityResult:
        """
        Pure python fallback compatibility results returned if Ollama is slow or fails.
        """
        room_amenities = [a.lower().strip() for a in (room_listing.get("amenities") or [])]
        tenant_prefs = tenant_profile.get("preferences", [])
        
        missing = []
        strengths = ["Deterministic match score computed successfully"]
        
        # Analyze tag match
        for pref in tenant_prefs:
            if pref.lower().strip() not in room_amenities:
                missing.append(pref)
            else:
                strengths.append(f"Matching amenity: {pref}")
                
        # Analyze budget match
        rent = float(room_listing.get("rent", 0))
        budget = float(tenant_profile.get("budget", 100000) or 100000)
        if rent <= budget:
            strengths.append("Within budget limit")
        else:
            missing.append("Exceeds budget limit")
            
        return CompatibilityResult(
            compatibility_score=rule_score,
            summary="Generated using fallback compatibility engine because AI service is unavailable.",
            strengths=strengths,
            missing_preferences=missing,
            recommendation="Please review listing details manually."
        )
