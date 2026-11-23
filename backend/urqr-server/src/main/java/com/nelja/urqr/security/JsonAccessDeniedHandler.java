package com.nelja.urqr.security;
import tools.jackson.databind.json.JsonMapper;import com.nelja.urqr.common.exception.RequestIdFilter;import com.nelja.urqr.common.response.ApiError;import jakarta.servlet.http.*;import java.io.IOException;import java.time.Instant;import java.util.List;import org.springframework.http.MediaType;import org.springframework.security.access.AccessDeniedException;import org.springframework.security.web.access.AccessDeniedHandler;import org.springframework.stereotype.Component;
@Component
public class JsonAccessDeniedHandler implements AccessDeniedHandler{
    private final JsonMapper mapper;
    public JsonAccessDeniedHandler(JsonMapper m){
        mapper=m;
    }
    @Override
    public void handle(HttpServletRequest r,HttpServletResponse s,AccessDeniedException e)throws IOException{
        s.setStatus(403);
        s.setContentType(MediaType.APPLICATION_JSON_VALUE);
        mapper.writeValue(s.getOutputStream(),new ApiError(Instant.now(),403,"FORBIDDEN","You are not allowed to perform this action",r.getRequestURI(),(String)r.getAttribute(RequestIdFilter.ATTRIBUTE),List.of()));}}
