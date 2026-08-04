package com.web.firm.settings;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/admin/settings")
@RequiredArgsConstructor
public class AdminSettingsController {

    private final SettingsService settingsService;

    @GetMapping
    public ResponseEntity<PlatformSettingDto> get() {
        return ResponseEntity.ok(PlatformSettingDto.fromEntity(settingsService.get()));
    }

    @PatchMapping
    public ResponseEntity<PlatformSettingDto> update(@RequestBody UpdateSettingsRequest req) {
        return ResponseEntity.ok(PlatformSettingDto.fromEntity(settingsService.update(req)));
    }
}
