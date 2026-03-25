package com.example.back_end.controller;

import com.example.back_end.model.Sinistre;
import com.example.back_end.service.SinistreService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/sinistres")
@CrossOrigin("*")
public class SinistreController {

    private final SinistreService sinistreService;

    public SinistreController(SinistreService sinistreService) {
        this.sinistreService = sinistreService;
    }

    @PostMapping(value = "/declarer", consumes = org.springframework.http.MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Sinistre> declarerSinistre(
            @RequestParam("cin") String cin,
            @RequestParam("typeSinistre") String typeSinistre,
            @RequestParam("description") String description,
            @RequestParam("lieu") String lieu,
            @RequestParam("date") String dateStr,
            @RequestParam(value = "image", required = false) MultipartFile image) {

        LocalDateTime date;
        try {
            date = LocalDateTime.parse(dateStr);
        } catch (Exception e) {
            System.out.println("FALLBACK DATE: " + dateStr);
            date = LocalDateTime.now();
        }
        Sinistre result = sinistreService.declarerSinistre(cin, typeSinistre, description, lieu, date, image);

        return ResponseEntity.ok(result);
    }
}
