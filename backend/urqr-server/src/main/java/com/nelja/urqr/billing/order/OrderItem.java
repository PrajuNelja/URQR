package com.nelja.urqr.billing.order;

import com.nelja.urqr.billing.catalog.item.MenuItem;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinColumns;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.math.BigDecimal;

@Entity
@Table(name = "order_item", indexes = @Index(name = "ix_order_item_hotel_order", columnList = "hotel_id,order_id"))
public class OrderItem {

    @Id @Column(length=96)
    private String id;
    @Column(name = "hotel_id", nullable = false, length = 64)
    private String hotelId;
    @Column(name = "order_id", nullable = false, length=96)
    private String orderId;
    @Column(name = "menu_item_id", nullable = false, length=96)
    private String menuItemId;
    @Column(name = "name_snapshot", nullable = false, length = 160)
    private String nameSnapshot;
    @Column(name = "price_snapshot", nullable = false, precision = 12, scale = 2)
    private BigDecimal priceSnapshot;
    @Column(nullable = false)
    private int quantity;
    @Column(name = "discount_amount", nullable = false, precision = 12, scale = 2)
    private BigDecimal discountAmount = BigDecimal.ZERO.setScale(2);
    @Column(name = "tax_cgst", nullable = false, precision = 12, scale = 2)
    private BigDecimal taxCgst = BigDecimal.ZERO.setScale(2);
    @Column(name = "tax_sgst", nullable = false, precision = 12, scale = 2)
    private BigDecimal taxSgst = BigDecimal.ZERO.setScale(2);
    @Column(name = "tax_vat", nullable = false, precision = 12, scale = 2)
    private BigDecimal taxVat = BigDecimal.ZERO.setScale(2);
    @Column(name = "line_total", nullable = false, precision = 12, scale = 2)
    private BigDecimal lineTotal;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumns({
            @JoinColumn(name = "hotel_id", referencedColumnName = "hotel_id", insertable = false, updatable = false),
            @JoinColumn(name = "order_id", referencedColumnName = "id", insertable = false, updatable = false)
    })
    private Order order;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumns({
            @JoinColumn(name = "hotel_id", referencedColumnName = "hotel_id", insertable = false, updatable = false),
            @JoinColumn(name = "menu_item_id", referencedColumnName = "id", insertable = false, updatable = false)
    })
    private MenuItem menuItem;

    protected OrderItem() { }

    public OrderItem(String id, String hotelId, String orderId, String menuItemId, String name, BigDecimal price, int quantity,
            BigDecimal discount, BigDecimal cgst, BigDecimal sgst, BigDecimal vat, BigDecimal total) {
        this.id = id;
        this.hotelId = hotelId;
        this.orderId = orderId;
        this.menuItemId = menuItemId;
        nameSnapshot = name;
        priceSnapshot = price;
        setQuantity(quantity);
        discountAmount = discount;
        taxCgst = cgst;
        taxSgst = sgst;
        taxVat = vat;
        lineTotal = total;
    }

    public String getId() { return id; }
    public String getHotelId() { return hotelId; }
    public String getOrderId() { return orderId; }
    public String getMenuItemId() { return menuItemId; }
    public String getNameSnapshot() { return nameSnapshot; }
    public BigDecimal getPriceSnapshot() { return priceSnapshot; }
    public int getQuantity() { return quantity; }
    public BigDecimal getDiscountAmount() { return discountAmount; }
    public BigDecimal getTaxCgst() { return taxCgst; }
    public BigDecimal getTaxSgst() { return taxSgst; }
    public BigDecimal getTaxVat() { return taxVat; }
    public BigDecimal getLineTotal() { return lineTotal; }

    public void setQuantity(int quantity) {
        if (quantity < 1 || quantity > 999) throw new IllegalArgumentException("Quantity must be between 1 and 999");
        this.quantity = quantity;
    }
}
