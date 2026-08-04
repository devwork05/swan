package com.web.firm.upload;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.web.firm.settings.PlatformSetting;
import com.web.firm.settings.SettingsService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

/**
 * Signed uploads to Cloudinary using credentials stored in {@link PlatformSetting}.
 * All authenticated users can upload (users upload payment proof, admins upload logos).
 */
@Slf4j
@RestController
@RequestMapping("/uploads")
@RequiredArgsConstructor
public class UploadController {

    private final SettingsService settingsService;

    @PostMapping
    public ResponseEntity<UploadResponse> upload(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "folder", required = false) String folder) throws IOException {

        PlatformSetting cfg = settingsService.get();
        if (isBlank(cfg.getCloudinaryCloudName()) || isBlank(cfg.getCloudinaryApiKey()) || isBlank(cfg.getCloudinaryApiSecret())) {
            throw new IllegalStateException("Cloudinary is not configured. Ask an admin to fill in Settings → Cloudinary.");
        }

        Cloudinary cloudinary = new Cloudinary(ObjectUtils.asMap(
                "cloud_name", cfg.getCloudinaryCloudName(),
                "api_key", cfg.getCloudinaryApiKey(),
                "api_secret", cfg.getCloudinaryApiSecret(),
                "secure", true));

        Map<String, Object> options = ObjectUtils.asMap(
                "resource_type", "auto",
                "folder", folder == null || folder.isBlank() ? "digital-trade" : folder);

        @SuppressWarnings("unchecked")
        Map<String, Object> result = cloudinary.uploader().upload(file.getBytes(), options);

        String url = (String) result.getOrDefault("secure_url", result.get("url"));
        String publicId = (String) result.get("public_id");
        return ResponseEntity.ok(new UploadResponse(url, publicId));
    }

    public record UploadResponse(String url, String publicId) {}

    private static boolean isBlank(String s) {
        return s == null || s.isBlank();
    }
}
