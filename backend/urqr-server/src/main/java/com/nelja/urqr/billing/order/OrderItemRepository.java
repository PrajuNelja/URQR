package com.nelja.urqr.billing.order;
import java.util.*; import org.springframework.data.jpa.repository.JpaRepository;
public interface OrderItemRepository extends JpaRepository<OrderItem,String>{List<OrderItem> findAllByHotelIdAndOrderIdOrderById(String hotel,String order);List<OrderItem> findAllByHotelIdAndOrderIdInOrderById(String hotel,java.util.Collection<String> orders);void deleteAllByHotelIdAndOrderId(String hotel,String order);}
