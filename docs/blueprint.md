# **App Name**: Interview Ace

## Core Features:

- Register/login: Use firebase authentication email/password, OAuth with google and github.
- Information Gathering: User inputs the target role, company applied to, and uploads their resume.
- Question Generation and Playback: The application converts questions based on role, company, and resume using the Gemini API for audio playback using Gemini TTS.
- Response Processing: Utilize Langchain/LangGraph to send user's audio responses to the Gemini model.
- Adaptive Questioning: An agent determines whether to ask a follow-up question based on the analysis of the user's answer using the tool.
- Performance Analysis and Reporting: After 5-8 questions, generate a detailed performance report using the tool to score metrics such as confidence, correctness, depth of knowledge, role fit, and areas for improvement.

## Style Guidelines:

- Primary color: Deep purple (#673AB7) for a professional yet innovative feel.
- Background color: Light lavender (#E1DDF2), a lighter tint of the primary hue, creates a soft and unobtrusive backdrop.
- Accent color: Teal (#3F8E7F) provides contrast and highlights important elements without being distracting.
- Font pairing: 'Space Grotesk' (sans-serif) for headlines and 'Inter' (sans-serif) for body text. 'Space Grotesk' offers a tech-forward feel, while 'Inter' ensures readability.
- Use clear, professional icons from a consistent set, with subtle animations on interactions.
- Clean, structured layout with a focus on readability and ease of navigation. Ample white space to reduce clutter.
- Subtle transitions and feedback animations to enhance user experience without being distracting.