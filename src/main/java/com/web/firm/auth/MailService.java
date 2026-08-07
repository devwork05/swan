package com.web.firm.auth;

import com.web.firm.settings.PlatformSetting;
import com.web.firm.settings.SettingsService;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.javamail.JavaMailSenderImpl;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.util.Properties;

/**
 * Sends transactional email using the SMTP settings the admin configured in
 * PlatformSettings. A fresh JavaMailSenderImpl is built per send — settings
 * are small and this keeps us honest when they change.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class MailService {

    private final SettingsService settingsService;

    public boolean isConfigured() {
        PlatformSetting s = settingsService.get();
        return s.getMailHost() != null && !s.getMailHost().isBlank()
                && s.getMailUsername() != null && !s.getMailUsername().isBlank();
    }

    /** Send an HTML email. Returns true on success, false if SMTP isn't configured or send failed. */
    public boolean sendHtml(String to, String subject, String html) {
        PlatformSetting s = settingsService.get();
        if (s.getMailHost() == null || s.getMailHost().isBlank()) {
            log.warn("Attempted to send mail but no SMTP host is configured");
            return false;
        }

        JavaMailSenderImpl sender = new JavaMailSenderImpl();
        sender.setHost(s.getMailHost());
        if (s.getMailPort() != null) sender.setPort(s.getMailPort());
        if (s.getMailUsername() != null) sender.setUsername(s.getMailUsername());
        if (s.getMailPassword() != null) sender.setPassword(s.getMailPassword());
        sender.setDefaultEncoding(StandardCharsets.UTF_8.name());

        Properties props = sender.getJavaMailProperties();
        props.put("mail.transport.protocol", "smtp");
        props.put("mail.smtp.auth", "true");
        String enc = s.getMailEncryption() == null ? "" : s.getMailEncryption().toLowerCase();
        if ("ssl".equals(enc)) {
            props.put("mail.smtp.ssl.enable", "true");
        } else {
            // Default to STARTTLS unless explicitly disabled with "none".
            props.put("mail.smtp.starttls.enable", !"none".equals(enc));
        }
        props.put("mail.smtp.connectiontimeout", "10000");
        props.put("mail.smtp.timeout", "10000");
        props.put("mail.smtp.writetimeout", "10000");

        try {
            MimeMessage msg = sender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(msg, false, StandardCharsets.UTF_8.name());
            String fromAddr = s.getMailFromAddress() != null && !s.getMailFromAddress().isBlank()
                    ? s.getMailFromAddress() : s.getMailUsername();
            String fromName = s.getMailFromName() != null && !s.getMailFromName().isBlank()
                    ? s.getMailFromName() : (s.getCompanyName() != null ? s.getCompanyName() : "Support");
            helper.setFrom(fromAddr, fromName);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(html, true);
            sender.send(msg);
            return true;
        } catch (Exception e) {
            log.error("Failed to send email to {}: {}", to, e.getMessage());
            return false;
        }
    }
}
