package com.nelja.urqr.billing.order;

import static org.junit.jupiter.api.Assertions.assertEquals;

import com.nelja.urqr.billing.catalog.item.MenuItem;
import java.math.BigDecimal;
import java.util.UUID;
import org.junit.jupiter.api.Test;

class OrderCalculationEngineTest {

    private final OrderCalculationEngine engine = new OrderCalculationEngine();

    @Test
    void discountsAndRoundsEachTaxComponentPerLine() {
        MenuItem item = new MenuItem(UUID.randomUUID(), UUID.randomUUID(), "Tea", new BigDecimal("100.00"));
        item.update(item.getCategoryId(), "Tea", new BigDecimal("100.00"), new BigDecimal("9.00"),
                new BigDecimal("9.00"), BigDecimal.ZERO, new BigDecimal("10.00"));

        OrderCalculationEngine.LineCalculation line = engine.calculate(item, 1);

        assertEquals(new BigDecimal("100.00"), line.gross());
        assertEquals(new BigDecimal("10.00"), line.discount());
        assertEquals(new BigDecimal("8.10"), line.cgst());
        assertEquals(new BigDecimal("8.10"), line.sgst());
        assertEquals(new BigDecimal("0.00"), line.vat());
        assertEquals(new BigDecimal("106.20"), line.total());
    }
}
