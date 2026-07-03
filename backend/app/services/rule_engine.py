import logging
from datetime import datetime
from typing import List, Dict, Any, Optional

logger = logging.getLogger(__name__)

class RuleEngine:
    def calculate_rule_score(
        self,
        room: Dict[str, Any],
        tenant_profile: Dict[str, Any],
        preferred_tags: Optional[List[str]] = None,
        max_budget: Optional[float] = None,
        move_in_date: Optional[str] = None
    ) -> int:
        """
        Calculates a deterministic rule score out of 100.
        Location Match (30 pts), Budget Match (30 pts), Move Date (20 pts), Tag Match (20 pts).
        """
        score = 0
        
        # 1. Location Match (up to 30 pts)
        location_score = 0
        preferred_location = tenant_profile.get("location", "") or ""
        
        # If there's an explicit search location, prioritize it
        search_loc = preferred_location.strip().lower()
        room_city = (room.get("city") or "").strip().lower()
        room_area = (room.get("area") or "").strip().lower()
        room_loc = (room.get("location") or "").strip().lower()
        
        if search_loc:
            if search_loc == room_city or search_loc in room_loc:
                location_score += 20
            if search_loc == room_area or room_area in search_loc:
                location_score += 10
        else:
            # Fallback to no-preference/default full points
            location_score = 30
            
        score += min(location_score, 30)

        # 2. Budget Match (up to 30 pts)
        rent = float(room.get("rent", 0))
        budget = max_budget if max_budget is not None else float(tenant_profile.get("budget", 100000) or 100000)
        
        if rent <= budget:
            score += 30
        elif rent <= budget * 1.1:
            score += 15
        elif rent <= budget * 1.2:
            score += 5

        # 3. Move Date / Availability Match (up to 20 pts)
        # room.available_from format: "YYYY-MM-DD"
        room_available_str = room.get("available_from") or room.get("availableFrom")
        target_date_str = move_in_date or tenant_profile.get("move_in_date") or tenant_profile.get("moveDate")

        if not target_date_str or not room_available_str:
            score += 20
        else:
            try:
                # Clean up format variations
                room_date = self._parse_date(room_available_str)
                target_date = self._parse_date(target_date_str)
                
                if room_date <= target_date:
                    score += 20
                else:
                    days_diff = (room_date - target_date).days
                    if days_diff <= 15:
                        score += 10
                    elif days_diff <= 30:
                        score += 5
            except Exception as e:
                logger.warning(f"Error parsing dates for rule score: {str(e)}. Defaulting to string comparison.")
                # Fallback to basic string comparison
                if room_available_str <= target_date_str:
                    score += 20
                else:
                    score += 5

        # 4. Tag / Amenities Match (up to 20 pts)
        # Compare room.amenities with preferred tags
        tags_to_match = preferred_tags if preferred_tags is not None else tenant_profile.get("preferences", [])
        
        if not tags_to_match:
            score += 20
        else:
            room_amenities = [a.lower().strip() for a in (room.get("amenities") or [])]
            match_count = 0
            for tag in tags_to_match:
                if tag.lower().strip() in room_amenities:
                    match_count += 1
            
            tag_fraction = match_count / len(tags_to_match)
            score += int(20 * tag_fraction)

        return min(max(score, 0), 100)

    def _parse_date(self, date_str: str) -> datetime:
        """Helper to parse common date formats."""
        for fmt in ("%Y-%m-%d", "%d-%m-%Y", "%Y-%m-%dT%H:%M:%S", "%Y-%m-%dT%H:%M:%S.%fZ"):
            try:
                return datetime.strptime(date_str.strip(), fmt)
            except ValueError:
                continue
        # If nothing matches, parse first 10 chars as ISO date if possible
        return datetime.strptime(date_str[:10].strip(), "%Y-%m-%d")
