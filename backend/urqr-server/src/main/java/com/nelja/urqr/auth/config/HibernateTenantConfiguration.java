package com.nelja.urqr.auth.config;

import com.nelja.urqr.auth.security.TenantIdentifierResolver;
import java.util.Map;
import org.springframework.boot.hibernate.autoconfigure.HibernatePropertiesCustomizer;
import org.springframework.context.annotation.Configuration;
import org.springframework.transaction.annotation.EnableTransactionManagement;

@Configuration(proxyBeanMethods = false)
@EnableTransactionManagement(order = 100)
public class HibernateTenantConfiguration implements HibernatePropertiesCustomizer {

    private final TenantIdentifierResolver tenantIdentifierResolver;

    public HibernateTenantConfiguration(TenantIdentifierResolver tenantIdentifierResolver) {
        this.tenantIdentifierResolver = tenantIdentifierResolver;
    }

    @Override
    public void customize(Map<String, Object> hibernateProperties) {
        hibernateProperties.put("hibernate.tenant_identifier_resolver", tenantIdentifierResolver);
    }
}
