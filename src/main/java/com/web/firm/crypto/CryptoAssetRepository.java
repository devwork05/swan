package com.web.firm.crypto;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CryptoAssetRepository extends JpaRepository<CryptoAsset, Long> {

    List<CryptoAsset> findAllByOrderBySortOrderAscIdAsc();

    List<CryptoAsset> findByListedTrueOrderBySortOrderAscIdAsc();

    Optional<CryptoAsset> findByExternalId(Long externalId);

    Optional<CryptoAsset> findBySymbolIgnoreCase(String symbol);
}
