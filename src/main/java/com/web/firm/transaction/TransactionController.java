package com.web.firm.transaction;

import com.web.firm.user.User;
import com.web.firm.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/transactions")
@RequiredArgsConstructor
public class TransactionController {

    private final TransactionRepository transactionRepository;
    private final UserRepository userRepository;

    @GetMapping
    public ResponseEntity<List<TransactionDto>> getTransactions() {
        User user = getCurrentUser();
        List<TransactionDto> transactions = transactionRepository.findByUserOrderByCreatedAtDesc(user).stream()
                .map(TransactionDto::fromEntity)
                .toList();
        return ResponseEntity.ok(transactions);
    }

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
}
