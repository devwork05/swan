package com.web.firm.session;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SessionDto {

    private Long id;
    private String jti;
    private String ipAddress;
    private String userAgent;
    private LocalDateTime lastActive;
    private LocalDateTime createdAt;
    /** True when this row matches the JWT the caller sent — set by the controller. */
    private boolean current;

    public static SessionDto fromEntity(UserSession s) {
        return SessionDto.builder()
                .id(s.getId())
                .jti(s.getJti())
                .ipAddress(s.getIpAddress())
                .userAgent(s.getUserAgent())
                .lastActive(s.getLastActive())
                .createdAt(s.getCreatedAt())
                .current(false)
                .build();
    }
}
