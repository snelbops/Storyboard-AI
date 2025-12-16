# Product Requirement Document (PRD): StoryBoard AI

## 1. Product Overview
**StoryBoard AI** is a web-based application designed to streamline the pre-production process for filmmakers, content creators, and instructional designers. By leveraging Google's Gemini AI models, the app transforms raw text scripts into visual storyboards, allowing users to visualize scenes in various artistic styles ranging from cinematic sketches to corporate explainer graphics.

## 2. Problem Statement
Visualizing a script is a time-consuming and expensive process often requiring professional storyboard artists.
*   **Filmmakers** struggle to communicate visual ideas to crew members quickly.
*   **Instructional Designers** need efficient ways to plan explainer videos and tutorials without complex design tools.
*   Existing tools are often too complex or do not offer style flexibility between narrative film and corporate/educational content.

## 3. Key Objectives
*   **Automation**: Automatically parse standard script formats into distinct scenes.
*   **Visualization**: Generate high-quality visual representations of scenes using Generative AI.
*   **Flexibility**: Support distinct visual modes ("Cinematic" vs. "Explainer") to cater to different use cases.
*   **Iterability**: Allow users to regenerate or edit specific images using natural language prompts.

## 4. Target Audience
*   **Filmmakers & Directors**: For narrative visualization (Movies, TV, Shorts).
*   **Content Creators**: For YouTube/Social Media video planning.
*   **Instructional Designers**: For corporate training videos, educational content, and "How-to" guides.
*   **Agencies**: For rapid pitching and concepting.

## 5. Functional Requirements

### 5.1 Script Analysis Engine
*   **Input**: User accepts raw text input (formatted loosely as a screenplay).
*   **Processing**: Uses `gemini-2.5-flash` to parse text.
*   **Output**: Structured JSON object containing:
    *   Scene Header (Slugline)
    *   Visual Action Description
    *   Character List
    *   Scene Number

### 5.2 Style System
The application must support two primary **Visual Styles**, each with specific **Sub-Styles**:

1.  **Cinematic (Narrative/Film)**
    *   *Pencil Sketch* (Default): Rough, graphite on paper, traditional storyboard look.
    *   *Film Noir*: High contrast, black & white, dramatic shadows.
    *   *Digital Painting*: High fidelity, atmospheric concept art.
    *   *Watercolor*: Artistic, expressive, loose coloring.

2.  **Explainer (Corporate/Education)**
    *   *Corporate Memphis* (Default): Flat vector art, bright solid colors, exaggerated proportions.
    *   *Whiteboard Animation*: Black marker on white background, stick figures, diagrammatic.
    *   *Isometric 3D*: Clean geometry, technical look, pastel colors.
    *   *Tech Line Art*: Blueprint aesthetic, schematic, minimal.

### 5.3 Scene Visualization
*   **Generation**: Users can generate an image for a specific scene card.
*   **Context Awareness**: The generation prompt must automatically incorporate the selected Style and Sub-Style to ensure visual consistency across the board.
*   **Model**: Uses `gemini-2.5-flash-image`.

### 5.4 Image Editing
*   **Refinement**: Users can modify an existing generated image using text instructions (e.g., "Add a cat in the corner").
*   **Style Preservation**: Edits must strictly adhere to the currently selected Sub-Style (e.g., an edit to a "Blueprint" image must remain a blueprint).

### 5.5 User Interface
*   **Input Screen**: Large text area for script, Style/Sub-Style selectors, and "Analyze" button.
*   **Storyboard View**: Grid layout of scene cards.
*   **Global Controls**: Floating or sticky navbar/menu to switch Styles and Sub-Styles dynamically without losing script data.
*   **Scene Card**: Displays header, characters, description, and the generated image container.

## 6. Technical Architecture

### 6.1 Tech Stack
*   **Frontend**: React 19 (TypeScript), Vite.
*   **Styling**: Tailwind CSS (Dark Mode default).
*   **Icons**: Lucide React.
*   **AI Integration**: Google GenAI SDK (`@google/genai`).

### 6.2 AI Models
*   **Script Breakdown**: `gemini-2.5-flash` (Optimized for text logic and JSON structure).
*   **Image Generation**: `gemini-2.5-flash-image` (Optimized for speed and prompt adherence).

### 6.3 Data Handling
*   **State Management**: React local state.
*   **Persistence**: Currently ephemeral (refreshes on reload). *Future: LocalStorage or Database.*

## 7. User Flow
1.  **Landing**: User sees the Script Input screen.
2.  **Configuration**: User pastes script and selects a visual style (e.g., "Explainer - Isometric").
3.  **Analysis**: User clicks "Analyze". App shows a loading state while parsing scenes.
4.  **Storyboard**: App transitions to the Scene Grid view.
5.  **Generation**: User clicks "Generate" on individual scenes or all scenes.
6.  **Refinement**: User notices a detail missing, clicks "Edit", types a correction, and the image updates.
7.  **Pivot**: User decides the style doesn't fit, switches the dropdown to "Cinematic - Noir", and regenerates images.

## 8. Success Metrics
*   **Accuracy**: Script breakdown correctly identifies 95% of scenes.
*   **Visual Consistency**: Generated images within a project adhere to the selected sub-style (e.g., no photorealistic images appearing in a whiteboard project).
*   **Latency**: Script analysis completes in <5 seconds; Image generation completes in <5 seconds per image.

## 9. Future Roadmap
*   **PDF Export**: Download the storyboard as a PDF document.
*   **Bulk Generate**: "Generate All" button to render the entire storyboard at once.
*   **Shot Types**: Dropdown on scene cards to specify camera angles (Wide, Close-up, POV) before generating.
*   **Video Generation**: Using Veo models to turn static storyboard frames into 3-second animatics.