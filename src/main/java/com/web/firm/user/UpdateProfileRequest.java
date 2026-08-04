package com.web.firm.user;

import lombok.Data;

import java.time.LocalDate;

/** User-editable subset — everything is optional. */
@Data
public class UpdateProfileRequest {
    private String fullName;
    private String avatarUrl;
    private String phone;
    private String country;
    private LocalDate dob;
    private String address;
    private Boolean hideBalance;
    private Boolean twoFaEnabled;
}
