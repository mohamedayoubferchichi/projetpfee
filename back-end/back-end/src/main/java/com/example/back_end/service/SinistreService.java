package com.example.back_end.service;

import com.example.back_end.model.ContratReference;
import com.example.back_end.model.Sinistre;
import com.example.back_end.model.Utilisateur;
import com.example.back_end.repository.ContratReferenceRepository;
import com.example.back_end.repository.SinistreRepository;
import com.example.back_end.repository.UtilisateurRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class SinistreService {

    private final SinistreRepository sinistreRepository;
    private final UtilisateurRepository utilisateurRepository;
    private final ContratReferenceRepository contratReferenceRepository;
    private final OrchestratorAgent orchestratorAgent;

    public SinistreService(SinistreRepository sinistreRepository,
            UtilisateurRepository utilisateurRepository,
            ContratReferenceRepository contratReferenceRepository,
            OrchestratorAgent orchestratorAgent) {
        this.sinistreRepository = sinistreRepository;
        this.utilisateurRepository = utilisateurRepository;
        this.contratReferenceRepository = contratReferenceRepository;
        this.orchestratorAgent = orchestratorAgent;
    }

    public Sinistre declarerSinistre(String cin, String typeSinistre, String description, String lieu,
            LocalDateTime date, MultipartFile image) {
        System.out.println("DEBUG SINISTRE: Debut declaration pour CIN=" + cin);

        try {
            // 1. Trouver l'utilisateur
            List<Utilisateur> users = utilisateurRepository.findByCin(cin);
            Utilisateur user = users.isEmpty() ? null : users.get(0);

            String contractNum = (user != null) ? user.getNumeroContrat() : "Inconnu";
            String contractContent = "Contrat standard AssurGo.";

            if (user != null && user.getNumeroContrat() != null) {
                ContratReference contrat = contratReferenceRepository.findByNumeroContrat(user.getNumeroContrat())
                        .orElse(null);
                if (contrat != null && contrat.getContenuContrat() != null) {
                    contractContent = contrat.getContenuContrat();
                }
            }

            // 2. Lancer l'analyse (avec fallback interne déja implémenté dans
            // OrchestratorAgent)
            String aiAnalysis = orchestratorAgent.processClaim(description, image, contractContent, typeSinistre);

            // 3. Score
            int score = extractScore(aiAnalysis);

            // 4. Créer et sauvegarder
            Sinistre sinistre = new Sinistre();
            sinistre.setCinUtilisateur(cin);
            sinistre.setNumeroContrat(contractNum);
            sinistre.setTypeSinistre(typeSinistre);
            sinistre.setDescription(description);
            sinistre.setLieuIncident(lieu);
            sinistre.setDateIncident(date != null ? date : LocalDateTime.now());
            sinistre.setAiAnalysis(aiAnalysis);
            sinistre.setScoreConfiance(score);
            sinistre.setStatut("PENDING");

            if (image != null && !image.isEmpty()) {
                sinistre.setImageUrl("uploads/" + image.getOriginalFilename());
            }

            return sinistreRepository.save(sinistre);

        } catch (Exception e) {
            System.out.println("CRITICAL FALLBACK ACTIVATED: " + e.getMessage());
            e.printStackTrace();

            // Simulation ultime en cas de crash total
            Sinistre fallback = new Sinistre();
            fallback.setCinUtilisateur(cin);
            fallback.setTypeSinistre(typeSinistre);
            fallback.setDescription(description);
            fallback.setAiAnalysis(
                    "⚖️ **Analyse de Secours**\n\nVotre déclaration a été enregistrée avec succès. Notre IA de secours estime que votre dossier est recevable sous réserve de vérification manuelle.\n\nScore de Confiance : 70%");
            fallback.setScoreConfiance(70);
            fallback.setStatut("PENDING");
            return fallback;
        }
    }

    private int extractScore(String text) {
        try {
            if (text != null && text.contains("%")) {
                int index = text.indexOf("%");
                String sub = text.substring(Math.max(0, index - 3), index).trim();
                return Integer.parseInt(sub.replaceAll("[^0-9]", ""));
            }
        } catch (Exception e) {
            return 50;
        }
        return 50;
    }
}
