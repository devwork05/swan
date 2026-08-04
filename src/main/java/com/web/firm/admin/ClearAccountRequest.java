package com.web.firm.admin;

import lombok.Data;

import java.util.List;

/** Multi-select clear. Accepts BALANCE / BONUS / REFERRAL / PROFIT / HISTORY. */
@Data
public class ClearAccountRequest {
    private List<String> targets;
}
