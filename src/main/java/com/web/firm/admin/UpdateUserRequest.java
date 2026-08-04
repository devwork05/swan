package com.web.firm.admin;

import lombok.Data;

import java.time.LocalDate;

/** Every field optional; only present ones are applied. */
@Data
public class UpdateUserRequest {
    private String fullName;
    private String email;
    private String role;
    private String phone;
    private String country;
    private LocalDate dob;
    private String address;
    private Boolean withdrawStatus;
    private Boolean twoFaEnabled;
    private Boolean hideBalance;
    private Boolean suspended;
    /** NONE / PENDING / VERIFIED. Also accepts legacy boolean `kycVerified`. */
    private String kycStatus;
    private Boolean kycVerified;
}
