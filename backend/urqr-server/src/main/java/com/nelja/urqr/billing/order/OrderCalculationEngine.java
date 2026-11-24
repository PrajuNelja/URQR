package com.nelja.urqr.billing.order;

import com.nelja.urqr.billing.catalog.item.MenuItem;
import java.math.BigDecimal;
import java.math.RoundingMode;

/** Applies discounts first and rounds each tax component to cents per line. */
public class OrderCalculationEngine {

    private static final BigDecimal ONE_HUNDRED = new BigDecimal("100");

    public LineCalculation calculate(MenuItem item, int quantity) {
        BigDecimal gross = money(item.getPrice().multiply(BigDecimal.valueOf(quantity)));
        BigDecimal discount = percent(gross, item.getDiscountPercent());
        BigDecimal taxable = gross.subtract(discount);
        BigDecimal cgst = percent(taxable, item.getCgstRate());
        BigDecimal sgst = percent(taxable, item.getSgstRate());
        BigDecimal vat = percent(taxable, item.getVatRate());
        BigDecimal total = money(taxable.add(cgst).add(sgst).add(vat));
        return new LineCalculation(gross, discount, cgst, sgst, vat, total);
    }

    private static BigDecimal percent(BigDecimal amount, BigDecimal rate) {
        return amount.multiply(rate).divide(ONE_HUNDRED, 2, RoundingMode.HALF_UP);
    }

    private static BigDecimal money(BigDecimal amount) {
        return amount.setScale(2, RoundingMode.HALF_UP);
    }

    public record LineCalculation(BigDecimal gross, BigDecimal discount, BigDecimal cgst,
            BigDecimal sgst, BigDecimal vat, BigDecimal total) { }
}
