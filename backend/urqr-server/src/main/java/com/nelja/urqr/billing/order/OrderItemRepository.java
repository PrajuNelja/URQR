package com.nelja.urqr.billing.order;
import java.util.*; import org.springframework.data.jpa.repository.JpaRepository;
public interface OrderItemRepository extends JpaRepository<OrderItem,UUID>{List<OrderItem> findAllByHotelIdAndOrderIdOrderById(String hotel,UUID order);List<OrderItem> findAllByHotelIdAndOrderIdInOrderById(String hotel,java.util.Collection<UUID> orders);void deleteAllByHotelIdAndOrderId(String hotel,UUID order);}
