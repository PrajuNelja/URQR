@org.springframework.modulith.ApplicationModule(allowedDependencies = {
        "auth::audit", "auth::hotel", "auth::roles", "auth::security", "auth::users",
        "common::exception", "common::persistence", "common::response"})
package com.nelja.urqr.billing;
