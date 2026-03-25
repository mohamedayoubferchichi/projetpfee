package com.example.back_end.service;

import com.example.back_end.dto.LoginRequest;
import com.example.back_end.dto.UtilisateurRegisterRequest;
import com.example.back_end.dto.UtilisateurRegisterResponse;
import com.example.back_end.model.Administrateur;
import com.example.back_end.model.StatutCompte;
import com.example.back_end.model.Utilisateur;
import com.example.back_end.repository.AdminRepository;
import com.example.back_end.repository.ContratReferenceRepository;
import com.example.back_end.repository.UtilisateurRepository;
import com.example.back_end.security.JwtService;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;

@Service
public class AuthService {

    private final AdminRepository adminRepository;
    private final UtilisateurRepository utilisateurRepository;
    private final ContratReferenceRepository contratReferenceRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(AdminRepository adminRepository,
            UtilisateurRepository utilisateurRepository,
            ContratReferenceRepository contratReferenceRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService) {
        this.adminRepository = adminRepository;
        this.utilisateurRepository = utilisateurRepository;
        this.contratReferenceRepository = contratReferenceRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    public String login(LoginRequest request) {
        Administrateur admin = adminRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials"));

        if (!passwordEncoder.matches(request.getPassword(), admin.getPassword())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials");
        }

        return jwtService.generateToken(admin.getEmail(), admin.getRole());
    }

    public UtilisateurRegisterResponse registerUtilisateur(UtilisateurRegisterRequest request) {
        System.out.println("--- DEBUG: DEBUT INSCRIPTION ---");
        String nom = request.getNom() == null ? "" : request.getNom().trim();
        String email = request.getEmail() == null ? "" : request.getEmail().trim();
        String password = request.getPassword() == null ? "" : request.getPassword().trim();
        String telephone = request.getTelephone() == null ? "" : request.getTelephone().trim();
        String cin = request.getCin() == null ? "" : request.getCin().trim();
        String numeroContrat = request.getNumeroContrat() == null ? "" : request.getNumeroContrat().trim();

        if (!StringUtils.hasText(nom) || !StringUtils.hasText(email) || !StringUtils.hasText(password)) {
            System.out.println("DEBUG: Champs obligatoires manquants.");
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Nom, email et mot de passe sont obligatoires");
        }

        if (utilisateurRepository.existsByEmail(email)) {
            System.out.println("DEBUG: L'email existe deja : " + email);
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email already exists");
        }

        try {
            Utilisateur utilisateur = new Utilisateur();
            utilisateur.setNom(nom);
            utilisateur.setEmail(email);
            utilisateur.setPassword(passwordEncoder.encode(password));
            utilisateur.setTelephone(StringUtils.hasText(telephone) ? telephone : null);
            utilisateur.setCin(StringUtils.hasText(cin) ? cin : null);
            utilisateur.setNumeroContrat(StringUtils.hasText(numeroContrat) ? numeroContrat : null);
            utilisateur.setRole("UTILISATEUR");

            boolean isVerified = StringUtils.hasText(cin)
                    && contratReferenceRepository.existsByCinAndDateFinContratGreaterThanEqual(cin, LocalDate.now());
            utilisateur.setStatutCompte(isVerified ? StatutCompte.VERIFIE : StatutCompte.NON_VERIFIE);

            System.out.println("DEBUG: Tentative de sauvegarde MongoDB pour " + email);
            Utilisateur savedUtilisateur = utilisateurRepository.save(utilisateur);
            System.out.println("DEBUG: Inscription réussie ! ID=" + savedUtilisateur.getId());
            return toRegisterResponse(savedUtilisateur);
        } catch (Exception e) {
            System.out.println("DEBUG ERROR: Exception lors de la creation du compte !");
            e.printStackTrace();
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,
                    "Erreur lors du save: " + e.getMessage());
        }
    }

    public String loginUtilisateur(LoginRequest request) {
        Utilisateur utilisateur = utilisateurRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials"));

        if (!passwordEncoder.matches(request.getPassword(), utilisateur.getPassword())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials");
        }

        boolean isVerified = StringUtils.hasText(utilisateur.getCin())
                && contratReferenceRepository.existsByCinAndDateFinContratGreaterThanEqual(
                        utilisateur.getCin().trim(),
                        LocalDate.now());
        StatutCompte computedStatut = isVerified ? StatutCompte.VERIFIE : StatutCompte.NON_VERIFIE;
        if (utilisateur.getStatutCompte() != computedStatut) {
            utilisateur.setStatutCompte(computedStatut);
            utilisateurRepository.save(utilisateur);
        }

        return jwtService.generateToken(utilisateur.getEmail(), utilisateur.getRole());
    }

    private UtilisateurRegisterResponse toRegisterResponse(Utilisateur utilisateur) {
        UtilisateurRegisterResponse response = new UtilisateurRegisterResponse();
        response.setId(utilisateur.getId());
        response.setNom(utilisateur.getNom());
        response.setEmail(utilisateur.getEmail());
        response.setTelephone(utilisateur.getTelephone());
        response.setCin(utilisateur.getCin());
        response.setNumeroContrat(utilisateur.getNumeroContrat());
        response.setRole(utilisateur.getRole());
        response.setStatutCompte(utilisateur.getStatutCompte());
        return response;
    }

}
