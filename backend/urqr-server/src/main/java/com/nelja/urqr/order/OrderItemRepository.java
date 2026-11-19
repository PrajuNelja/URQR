package com.nelja.urqr.order;
import java.util.*; import org.springframework.data.jpa.repository.JpaRepository;
public interface OrderItemRepository extends JpaRepository<OrderItem,UUID>{List<OrderItem> findAllByHotelIdAndOrderIdOrderById(UUID hotel,UUID order);List<OrderItem> findAllByHotelIdAndOrderIdInOrderById(UUID hotel,java.util.Collection<UUID> orders);void deleteAllByHotelIdAndOrderId(UUID hotel,UUID order);}
