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

    @Test
    void calculatesZeroDiscountAndZeroTax() {
        MenuItem item = new MenuItem(UUID.randomUUID(), UUID.randomUUID(), "Mineral Water", new BigDecimal("25.00"));
        item.update(item.getCategoryId(), "Mineral Water", new BigDecimal("25.00"), BigDecimal.ZERO,
                BigDecimal.ZERO, BigDecimal.ZERO, BigDecimal.ZERO);

        OrderCalculationEngine.LineCalculation line = engine.calculate(item, 4);

        assertEquals(new BigDecimal("100.00"), line.gross());
        assertEquals(new BigDecimal("0.00"), line.discount());
        assertEquals(new BigDecimal("0.00"), line.cgst());
        assertEquals(new BigDecimal("0.00"), line.sgst());
        assertEquals(new BigDecimal("0.00"), line.vat());
        assertEquals(new BigDecimal("100.00"), line.total());
    }

    @Test
    void calculatesMultiQuantityWithCGSTAndSGST() {
        MenuItem item = new MenuItem(UUID.randomUUID(), UUID.randomUUID(), "Paneer Butter Masala", new BigDecimal("240.00"));
        item.update(item.getCategoryId(), "Paneer Butter Masala", new BigDecimal("240.00"), new BigDecimal("2.50"),
                new BigDecimal("2.50"), BigDecimal.ZERO, new BigDecimal("5.00"));

        // 3 items @ 240 = 720.00 gross
        // Discount 5% of 720 = 36.00
        // Taxable = 684.00
        // CGST 2.5% of 684 = 17.10
        // SGST 2.5% of 684 = 17.10
        // Total = 684.00 + 17.10 + 17.10 = 718.20
        OrderCalculationEngine.LineCalculation line = engine.calculate(item, 3);

        assertEquals(new BigDecimal("720.00"), line.gross());
        assertEquals(new BigDecimal("36.00"), line.discount());
        assertEquals(new BigDecimal("17.10"), line.cgst());
        assertEquals(new BigDecimal("17.10"), line.sgst());
        assertEquals(new BigDecimal("0.00"), line.vat());
        assertEquals(new BigDecimal("718.20"), line.total());
    }

    @Test
    void calculatesVATOnlyWithoutGST() {
        MenuItem item = new MenuItem(UUID.randomUUID(), UUID.randomUUID(), "Special Juice", new BigDecimal("120.00"));
        item.update(item.getCategoryId(), "Special Juice", new BigDecimal("120.00"), BigDecimal.ZERO,
                BigDecimal.ZERO, new BigDecimal("12.50"), BigDecimal.ZERO);

        // 2 items @ 120 = 240.00 gross
        // Discount 0%
        // VAT 12.5% of 240 = 30.00
        // Total = 270.00
        OrderCalculationEngine.LineCalculation line = engine.calculate(item, 2);

        assertEquals(new BigDecimal("240.00"), line.gross());
        assertEquals(new BigDecimal("0.00"), line.discount());
        assertEquals(new BigDecimal("0.00"), line.cgst());
        assertEquals(new BigDecimal("0.00"), line.sgst());
        assertEquals(new BigDecimal("30.00"), line.vat());
        assertEquals(new BigDecimal("270.00"), line.total());
    }

    @Test
    void calculatesFullHundredPercentDiscount() {
        MenuItem item = new MenuItem(UUID.randomUUID(), UUID.randomUUID(), "Complimentary Sweet", new BigDecimal("50.00"));
        item.update(item.getCategoryId(), "Complimentary Sweet", new BigDecimal("50.00"), new BigDecimal("9.00"),
                new BigDecimal("9.00"), BigDecimal.ZERO, new BigDecimal("100.00"));

        OrderCalculationEngine.LineCalculation line = engine.calculate(item, 2);

        assertEquals(new BigDecimal("100.00"), line.gross());
        assertEquals(new BigDecimal("100.00"), line.discount());
        assertEquals(new BigDecimal("0.00"), line.cgst());
        assertEquals(new BigDecimal("0.00"), line.sgst());
        assertEquals(new BigDecimal("0.00"), line.vat());
        assertEquals(new BigDecimal("0.00"), line.total());
    }

    @Test
    void calculatesHalfUpRoundingPrecisionOnFractionalAmounts() {
        MenuItem item = new MenuItem(UUID.randomUUID(), UUID.randomUUID(), "Idli Set", new BigDecimal("33.33"));
        item.update(item.getCategoryId(), "Idli Set", new BigDecimal("33.33"), new BigDecimal("2.50"),
                new BigDecimal("2.50"), BigDecimal.ZERO, BigDecimal.ZERO);

        // 1 item @ 33.33 gross
        // CGST 2.5% of 33.33 = 0.83325 -> 0.83
        // SGST 2.5% of 33.33 = 0.83325 -> 0.83
        // Total = 33.33 + 0.83 + 0.83 = 34.99
        OrderCalculationEngine.LineCalculation line = engine.calculate(item, 1);

        assertEquals(new BigDecimal("33.33"), line.gross());
        assertEquals(new BigDecimal("0.00"), line.discount());
        assertEquals(new BigDecimal("0.83"), line.cgst());
        assertEquals(new BigDecimal("0.83"), line.sgst());
        assertEquals(new BigDecimal("34.99"), line.total());
    }
}
