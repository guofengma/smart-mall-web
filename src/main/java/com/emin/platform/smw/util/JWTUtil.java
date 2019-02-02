package com.emin.platform.smw.util;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;

import java.util.Date;
import java.util.HashMap;
import java.util.Map;

public class JWTUtil {
   // public static final long EXPIRATION_TIME = 360_000L; // 100 hour
   public static final long EXPIRATION_TIME = 1L; // 100 hour
    public static final String SECRET = "CDYXTECH_JWT";
    public static final String TOKEN_PREFIX = "PGUIDE";
    public static final String HEADER_STRING = "Authorization";

    public static String generateToken(String username) {
        HashMap<String, Object> map = new HashMap<>();
        //you can put any data in the map
        map.put("username", username);
        String jwt = Jwts.builder()
                .setClaims(map)
                .setExpiration(new Date(System.currentTimeMillis() + EXPIRATION_TIME))
                .signWith(SignatureAlgorithm.HS512, SECRET)
                .compact();
        return jwt;
    }

    public static String validateToken(String token) {
        if (token != null) {
            // parse the token.
            Map<String,Object> body = Jwts.parser()
                    .setSigningKey(SECRET)
                    .parseClaimsJws(token.replace(TOKEN_PREFIX, ""))
                    .getBody();
            String username = (String) (body.get("username"));
            if(username == null || username.isEmpty())
                throw new TokenValidationException("Wrong token without username");
            else
                return username;
        }else{
            throw new TokenValidationException("Missing token");
        }
    }

   public static class TokenValidationException extends RuntimeException {
	   	private static final long serialVersionUID = 1L;

		public TokenValidationException(String msg) {
            super(msg);
        }
    }

    public static void main(String[] args) {
        System.out.println(JWTUtil.generateToken("admin"));
    }
}
