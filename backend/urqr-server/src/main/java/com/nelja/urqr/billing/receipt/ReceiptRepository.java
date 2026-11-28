package com.nelja.urqr.billing.receipt;
import java.util.*; import org.springframework.data.jpa.repository.JpaRepository;
public interface ReceiptRepository extends JpaRepository<Receipt,String>{Optional<Receipt> findByHotelIdAndOrderId(String hotel,String order);Optional<Receipt> findByHotelIdAndReceiptNumber(String hotel,String number);}
