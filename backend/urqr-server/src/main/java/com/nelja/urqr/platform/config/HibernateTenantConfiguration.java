package com.nelja.urqr.platform.config;

import com.nelja.urqr.platform.security.TenantIdentifierResolver;
import java.util.Map;
import org.springframework.boot.hibernate.autoconfigure.HibernatePropertiesCustomizer;
import org.springframework.context.annotation.Configuration;

@Configuration(proxyBeanMethods = false)
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
