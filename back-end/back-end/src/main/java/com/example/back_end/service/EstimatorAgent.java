package com.example.back_end.service;

import dev.langchain4j.model.chat.ChatLanguageModel;
import dev.langchain4j.model.chat.request.ChatRequest;
import dev.langchain4j.model.chat.response.ChatResponse;
import dev.langchain4j.model.ollama.OllamaChatModel;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import java.util.Base64;
import java.time.Duration;

@Service
public class EstimatorAgent {

    private final ChatLanguageModel visionModel;

    public EstimatorAgent() {
        // Configuration locale pour le modèle Llava (analyse d'images)
        this.visionModel = OllamaChatModel.builder()
                .baseUrl("http://localhost:11434")
                .modelName("llava") // Modèle multimodal
                .timeout(Duration.ofMinutes(5)) // L'analyse d'image peut être longue localement
                .temperature(0.0) // On veut un résultat précis, pas de l'inventivité
                .build();
    }

    /**
     * Analyse l'image du sinistre et renvoie une description précise des dommages.
     */
    public String analyzeDamage(MultipartFile imageFile, String userDescription) {
        try {
            // 1. Convertir l'image en Base64
            byte[] imageBytes = imageFile.getBytes();
            String base64Image = Base64.getEncoder().encodeToString(imageBytes);

            // 2. Préparer le message pour LLaVA
            String prompt = """
                    Tu es un expert en assurance automobile.
                    Analyse cette image de véhicule accidenté avec la plus grande précision.
                    Description fournie par le client: "%s"

                    Décris:
                    1. Les éléments du véhicule endommagés (ex: pare-chocs, phare, carrosserie).
                    2. La gravité des dommages (légers, moyens, graves).
                    3. Le coût estimé de la réparation sur une échelle de 1 à 10.
                    Sois bref et très factuel. Appuie-toi visuellement sur la photo.
                    """.formatted(userDescription != null ? userDescription : "Aucune");

            // Option 1 : Envoyer via UserMessage
            dev.langchain4j.data.message.UserMessage userMessage = dev.langchain4j.data.message.UserMessage.from(
                    dev.langchain4j.data.message.TextContent.from(prompt),
                    dev.langchain4j.data.message.ImageContent.from(base64Image, imageFile.getContentType())
            );

            ChatResponse response = visionModel.chat(ChatRequest.builder().messages(userMessage).build());
            return response.aiMessage().text();
            
        } catch (Exception e) {
            e.printStackTrace();
            return "Erreur lors de l'analyse de l'image par l'Estimator Agent: " + e.getMessage();
        }
    }
}
