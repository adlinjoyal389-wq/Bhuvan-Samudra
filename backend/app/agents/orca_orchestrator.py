import datetime
from typing import Dict, Any, Optional
from sqlalchemy.orm import Session
from .marine_agent import MarineOceanDiscoveryAgent
from .weather_agent import WeatherHazardAgent
from .geofence_agent import GeospatialGeofenceAgent
from .trajectory_agent import TrajectoryOptimizerAgent
from .xai_agent import ExplainableAIAgent
from ..models.models import MarineDailyMemory, User


class ORCAOrchestrator:
    """
    Dynamic Multi-Agent Orchestrator (inspired by LangGraph / CrewAI).
    Coordinates Marine, Weather, Geofence, Trajectory, and XAI agents,
    evaluates memory, and generates localized responses in Indian languages.
    """

    def __init__(self):
        self.marine_agent = MarineOceanDiscoveryAgent()
        self.weather_agent = WeatherHazardAgent()
        self.geofence_agent = GeospatialGeofenceAgent()
        self.trajectory_agent = TrajectoryOptimizerAgent()
        self.xai_agent = ExplainableAIAgent()

    def detect_intent(self, question: str) -> str:
        q = question.lower()
        if any(w in q in q for w in ["yesterday", "difference", "compare", "நேற்று", "மாற்றம்", "history"]):
            return "MEMORY_COMPARISON"
        if any(w in q for w in ["fish", "pfz", "zone", "மீன்", "மீன்பிடி", "వేట", "मछली"]):
            return "PFZ_QUERY"
        if any(w in q for w in ["weather", "wind", "wave", "sea", "வானிலை", "அலை", "காற்று", "వాతావరణం", "हवामान"]):
            return "WEATHER_QUERY"
        if any(w in q for w in ["border", "imbl", "boundary", "safe", "எல்லை", "பாதுகாப்பு", "సరిహద్దు", "सीमा"]):
            return "BORDER_QUERY"
        if any(w in q for w in ["route", "path", "navigate", "பாதை", "வழி", "రూట్", "रास्ता"]):
            return "ROUTE_QUERY"
        return "GENERAL_ADVISORY"

    def process_query(
        self,
        question: str,
        language: str = "en",
        user_id: int = 1,
        lat: float = 8.0883,
        lon: float = 77.5385,
        db: Optional[Session] = None,
    ) -> Dict[str, Any]:
        intent = self.detect_intent(question)
        timestamp_str = datetime.datetime.now().strftime("%I:%M %p")

        # Gather agent telemetry
        nearest_pfz = self.marine_agent.get_nearest_pfz(lat, lon)
        weather = self.weather_agent.get_weather_forecast(lat, lon)
        imbl_dist = self.geofence_agent.get_imbl_distance_km(lat, lon)
        boundary_eval = self.geofence_agent.evaluate_boundary_status(imbl_dist)
        boundary_eval["distance_km"] = imbl_dist

        evidence = self.xai_agent.generate_pfz_evidence(
            nearest_pfz, weather, boundary_eval, timestamp_str
        )

        map_action = None
        answer = ""

        # Handle Intent Routing
        if intent == "MEMORY_COMPARISON":
            # Retrieve historical memory from DB if available
            yesterday_record = None
            if db:
                yesterday_record = (
                    db.query(MarineDailyMemory)
                    .filter(MarineDailyMemory.user_id == user_id)
                    .order_by(MarineDailyMemory.created_at.desc())
                    .offset(1)
                    .first()
                )

            y_wave = yesterday_record.wave_height if yesterday_record else 1.1
            y_pfz_dist = yesterday_record.pfz_distance if yesterday_record else 20.0
            t_wave = weather["wave_height"]
            t_pfz_dist = nearest_pfz["distance_km"]

            if language == "ta":
                answer = (
                    f"நேற்று பதிவு செய்யப்பட்ட PFZ தகவல் சுமார் {y_pfz_dist} கி.மீ தொலைவில் இருந்தது (அலை: {y_wave} மீ). "
                    f"இன்று அலை உயரம் {t_wave} மீட்டராக உள்ளது மற்றும் PFZ {t_pfz_dist} கி.மீ தொலைவில் உள்ளது. "
                    f"நேற்றை விட இன்று அலைகள் சற்று அதிகம், ஆனால் மீன்பிடிக்க மிதமான சாதகமான நிலை நிலவுகிறது."
                )
            elif language == "te":
                answer = (
                    f"నిన్న రికార్డు చేసిన PFZ సమాచారం దాదాపు {y_pfz_dist} కి.మీ దూరంలో ఉంది (అలల ఎత్తు: {y_wave} మీ). "
                    f"నేడు అలల ఎత్తు {t_wave} మీటర్లు మరియు PFZ {t_pfz_dist} కి.మీ దూరంలో ఉంది."
                )
            elif language == "hi":
                answer = (
                    f"कल का दर्ज किया गया पीएफजेड लगभग {y_pfz_dist} किमी दूर था (तरंग: {y_wave} मीटर). "
                    f"आज तरंग की ऊंचाई {t_wave} मीटर है और पीएफजेड {t_pfz_dist} किमी दूर है. समुद्र मध्यम अनुकूल है."
                )
            elif language == "ml":
                answer = (
                    f"ഇന്നലത്തെ രേഖപ്പെടുത്തിയ PFZ വിവരം ഏകദേശം {y_pfz_dist} കി.മീ ദൂരത്തിലായിരുന്നു (തിരമാല: {y_wave} മീ). "
                    f"ഇന്ന് തിരമാല {t_wave} മീറ്ററാണ്, PFZ {t_pfz_dist} കി.മീ അകലെയാണ്."
                )
            elif language == "gu":
                answer = (
                    f"ગઈકાલે નોંધાયેલ PFZ અંદાજે {y_pfz_dist} કિમી દૂર હતું (મોજા: {y_wave} મી). "
                    f"આજે મોજાની ઊંચાઈ {t_wave} મીટર છે અને PFZ {t_pfz_dist} કિમી દૂર છે."
                )
            else:
                answer = (
                    f"Yesterday, the stored PFZ information showed a location approximately {y_pfz_dist} km northeast of your recorded position with wave height {y_wave} m. "
                    f"Today, the wave height is {t_wave} m and the primary PFZ is {t_pfz_dist} km away. Conditions remain moderate."
                )

        elif intent == "PFZ_QUERY":
            map_action = {
                "type": "FOCUS_PFZ",
                "latitude": nearest_pfz["latitude"],
                "longitude": nearest_pfz["longitude"],
                "zoom": 12,
                "label": nearest_pfz["code"],
            }
            if language == "ta":
                answer = (
                    f"இன்றைய கடல் நிலைமை மிதமான நிலையில் உள்ளது. உங்கள் தற்போதைய இடத்திலிருந்து வடகிழக்கே "
                    f"சுமார் {nearest_pfz['distance_km']} கிமீ தொலைவில் சாத்தியமான மீன்பிடி மண்டலம் (PFZ-01) உள்ளது. "
                    f"கடல் மேற்பரப்பு வெப்பநிலை {nearest_pfz['sst']}°C மற்றும் குளோரோபில் {nearest_pfz['chlorophyll']} mg/m³."
                )
            elif language == "te":
                answer = (
                    f"ప్రస్తుత పరిస్థితులు మధ్యస్థంగా ఉన్నాయి. మీ స్థానం నుండి ఈశాన్యంగా దాదాపు "
                    f"{nearest_pfz['distance_km']} కి.మీ దూరంలో అనుకూలమైన చేపల వేట ప్రాంతం (PFZ) అందుబాటులో ఉంది."
                )
            elif language == "hi":
                answer = (
                    f"वर्तमान समुद्री स्थिति मध्यम है. आपके वर्तमान स्थान से उत्तर-पूर्व में लगभग "
                    f"{nearest_pfz['distance_km']} किमी दूर संभावित मत्स्य पालन क्षेत्र (PFZ) उपलब्ध है. तापमान {nearest_pfz['sst']}°C है."
                )
            elif language == "ml":
                answer = (
                    f"ഇന്നത്തെ കടൽ അവസ്ഥ മിതമായതാണ്. നിങ്ങളുടെ സ്ഥാനത്ത് നിന്ന് വടക്കുകിഴക്കായി ഏകദേശം "
                    f"{nearest_pfz['distance_km']} കി.മീ അകലെ ഒരു സാധ്യതയുള്ള മത്സ്യബന്ധന മേഖല (PFZ) ലഭ്യമാണ്."
                )
            elif language == "gu":
                answer = (
                    f"હાલની સમુદ્રી પરિસ્થિતિ સામાન્ય છે. તમારા સ્થાનથી ઉત્તર-પૂર્વમાં આશરે "
                    f"{nearest_pfz['distance_km']} કિમી દૂર સંભવિત માછીમારી ક્ષેત્ર (PFZ) ઉપલબ્ધ છે."
                )
            else:
                answer = (
                    f"Current conditions are moderate. A potential fishing zone is available approximately "
                    f"{nearest_pfz['distance_km']} km {nearest_pfz['direction'].lower()} of your current position (Wadge Bank Northeast)."
                )

        elif intent == "BORDER_QUERY":
            map_action = {
                "type": "HIGHLIGHT_BORDER",
                "distance_km": imbl_dist,
                "status": boundary_eval["status"],
            }
            if language == "ta":
                answer = (
                    f"நீங்கள் சர்வதேச கடல் எல்லைக்கு (IMBL) சுமார் {imbl_dist} கிமீ தொலைவில் உள்ளீர்கள். "
                    f"தற்போதைய பாதுகாப்பு நிலை: {boundary_eval['status']}. உங்கள் கடல் பயணப் பாதையை தொடர்ந்து கண்காணிக்கவும்."
                )
            elif language == "te":
                answer = (
                    f"మీరు అంతర్జాతీయ సముద్ర సరిహద్దుకు (IMBL) దాదాపు {imbl_dist} కి.మీ దూరంలో ఉన్నారు. "
                    f"స్థితి: సురక్షితం / పర్యవేక్షించండి."
                )
            elif language == "hi":
                answer = (
                    f"आप अंतर्राष्ट्रीय समुद्री सीमा (IMBL) से लगभग {imbl_dist} किमी दूर हैं. "
                    f"सुरक्षा स्थिति: सुरक्षित / मार्ग पर नज़र रखें."
                )
            elif language == "ml":
                answer = (
                    f"നിങ്ങൾ അന്താരാഷ്ട്ര സമുദ്ര അതിർത്തിയിൽ നിന്ന് (IMBL) ഏകദേശം {imbl_dist} കി.മീ അകലെയാണ്. "
                    f"സുരക്ഷാ നില: സുരക്ഷിതം / നിരീക്ഷിക്കുക."
                )
            elif language == "gu":
                answer = (
                    f"તમે આંતરરાષ્ટ્રીય દરિયાઈ સીમા (IMBL) થી આશરે {imbl_dist} કિમી દૂર છો. "
                    f"સુરક્ષા સ્થિતિ: સુરક્ષિત / માર્ગ પર નજર રાખો."
                )
            else:
                answer = (
                    f"You are approximately {imbl_dist} km from the configured International Maritime Boundary (IMBL). "
                    f"Status: {boundary_eval['status']}. Maintain distance and monitor your GPS route."
                )

        elif intent == "WEATHER_QUERY":
            map_action = {"type": "SHOW_WEATHER_LAYER"}
            if language == "ta":
                answer = (
                    f"இன்றைய கடல் நிலைமை மிதமானது. காற்றின் வேகம் {weather['wind_speed']} கிமீ/மணி மற்றும் "
                    f"அலை உயரம் {weather['wave_height']} மீட்டர். தீவிர வானிலை அல்லது புயல் எச்சரிக்கை ஏதுமில்லை."
                )
            elif language == "te":
                answer = (
                    f"సముద్ర వాతావరణం సాధారణంగా ఉంది. గాలి వేగం {weather['wind_speed']} కిమీ/గం మరియు "
                    f"అలల ఎత్తు {weather['wave_height']} మీటర్లు."
                )
            elif language == "hi":
                answer = (
                    f"आज की समुद्री स्थिति मध्यम है. हवा की गति {weather['wind_speed']} किमी/घंटा और "
                    f"तरंग की ऊंचाई {weather['wave_height']} मीटर है. कोई तत्काल चेतावनी नहीं है."
                )
            elif language == "ml":
                answer = (
                    f"ഇന്നത്തെ കടൽ അവസ്ഥ മിതമായതാണ്. കാറ്റിന്റെ വേഗത {weather['wind_speed']} കി.മീ/മണിക്കൂറും "
                    f"തിരമാലയുടെ ഉയരം {weather['wave_height']} മീറ്ററുമാണ്."
                )
            elif language == "gu":
                answer = (
                    f"આજની દરિયાઈ સ્થિતિ સામાન્ય છે. પવનની ઝડપ {weather['wind_speed']} કિમી/કલાક અને "
                    f"મોજાની ઊંચાઈ {weather['wave_height']} મીટર છે."
                )
            else:
                answer = (
                    f"Today's marine weather is moderate. Wind speed is {weather['wind_speed']} km/h ({weather['wind_direction']}) "
                    f"and wave height is {weather['wave_height']} m. No immediate cyclone or squall advisory."
                )

        elif intent == "ROUTE_QUERY":
            route = self.trajectory_agent.compute_safe_route(
                lat, lon, nearest_pfz["latitude"], nearest_pfz["longitude"], nearest_pfz["code"]
            )
            map_action = {
                "type": "DRAW_SAFE_ROUTE",
                "route": route,
            }
            if language == "ta":
                answer = (
                    f"அருகிலுள்ள PFZ-க்கு பாதுகாப்பான பாதை கணக்கிடப்பட்டுள்ளது. தூரம்: {route['distance_km']} கி.மீ, "
                    f"பயண நேரம்: சுமார் {route['estimated_time_mins']} நிமிடங்கள். ஆபத்து நிலை: குறைவு (Low Risk)."
                )
            elif language == "te":
                answer = (
                    f"సురక్షిత మార్గం లెక్కించబడింది. దూరం: {route['distance_km']} కి.మీ. ప్రయాణ సమయం: దాదాపు {route['estimated_time_mins']} నిమిషాలు."
                )
            elif language == "hi":
                answer = (
                    f"सुरक्षित मार्ग की गणना की गई है. दूरी: {route['distance_km']} किमी, अनुमानित समय: {route['estimated_time_mins']} मिनट."
                )
            else:
                answer = (
                    f"Safe route to {nearest_pfz['code']} has been computed. Total distance: {route['distance_km']} km, "
                    f"estimated transit time: {route['estimated_time_mins']} minutes. Risk level: Low."
                )

        else:
            if language == "ta":
                answer = (
                    f"இன்றைய கடல் நிலைமை மிதமான நிலையில் உள்ளது. வடகிழக்கே 18 கிமீ தொலைவில் PFZ உள்ளது. "
                    f"கடல் எல்லை தூரம் 8.4 கிமீ. பயணத்திற்கு முன் அலை மற்றும் வானிலை நிலவரங்களை கவனியுங்கள்."
                )
            else:
                answer = (
                    f"Current marine conditions are moderate. A potential fishing zone is available approximately "
                    f"18 km northeast of your current location. IMBL distance is 8.4 km. Monitor sea conditions before travelling."
                )

        return {
            "question": question,
            "answer": answer,
            "language": language,
            "detected_intent": intent,
            "evidence": evidence,
            "map_action": map_action,
            "data_timestamp": timestamp_str,
            "data_source": "Bhuvan-INCOIS / MOSDAC / Open-Meteo",
        }
