package com.web.firm.settings;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/settings")
@RequiredArgsConstructor
public class PublicSettingsController {

    private final SettingsService settingsService;

    @GetMapping
    public ResponseEntity<PublicSettingsDto> get() {
        return ResponseEntity.ok(PublicSettingsDto.fromEntity(settingsService.get()));
    }
}
