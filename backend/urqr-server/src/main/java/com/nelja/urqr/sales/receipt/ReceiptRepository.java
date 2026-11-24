package com.nelja.urqr.sales.receipt;
import java.util.*; import org.springframework.data.jpa.repository.JpaRepository;
public interface ReceiptRepository extends JpaRepository<Receipt,UUID>{Optional<Receipt> findByHotelIdAndOrderId(UUID hotel,UUID order);Optional<Receipt> findByHotelIdAndReceiptNumber(UUID hotel,String number);}
