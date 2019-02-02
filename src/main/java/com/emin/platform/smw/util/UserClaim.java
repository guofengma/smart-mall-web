package com.emin.platform.smw.util;

import java.io.Serializable;

public class UserClaim implements Serializable {
    private String realName;
    private String authLatestSequence;
    private Long ecmId;
    private Long[] permissionGroupIds;
    private String mobile;
    private Long id;
    private Integer userType;
    private Long[] organizationGroupIds;

    public UserClaim() {
    }


    public UserClaim(String realName, String authLatestSequence, Long ecmId, Long[] permissionGroupIds,
                     String mobile, Long id, Integer userType, Long[] organizationGroupIds) {
        this.realName = realName;
        this.authLatestSequence = authLatestSequence;
        this.ecmId = ecmId;
        this.permissionGroupIds = permissionGroupIds;
        this.mobile = mobile;
        this.id = id;
        this.userType = userType;
        this.organizationGroupIds = organizationGroupIds;
    }

    public String getRealName() {
        return realName;
    }

    public void setRealName(String realName) {
        this.realName = realName;
    }

    public String getAuthLatestSequence() {
        return authLatestSequence;
    }

    public void setAuthLatestSequence(String authLatestSequence) {
        this.authLatestSequence = authLatestSequence;
    }

    public Long getEcmId() {
        return ecmId;
    }

    public void setEcmId(Long ecmId) {
        this.ecmId = ecmId;
    }

    public Long[] getPermissionGroupIds() {
        return permissionGroupIds;
    }

    public void setPermissionGroupIds(Long[] permissionGroupIds) {
        this.permissionGroupIds = permissionGroupIds;
    }

    public String getMobile() {
        return mobile;
    }

    public void setMobile(String mobile) {
        this.mobile = mobile;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Integer getUserType() {
        return userType;
    }

    public void setUserType(Integer userType) {
        this.userType = userType;
    }

    public Long[] getOrganizationGroupIds() {
        return organizationGroupIds;
    }

    public void setOrganizationGroupIds(Long[] organizationGroupIds) {
        this.organizationGroupIds = organizationGroupIds;
    }

    public Long getMallId(){
        return ecmId;
    }

    public static final class UserClaimBuilder {
        private String realName;
        private String authLatestSequence;
        private Long ecmId;
        private Long[] permissionGroupIds;
        private String mobile;
        private Long id;
        private Integer userType;
        private Long[] organizationGroupIds;

        private UserClaimBuilder() {
        }

        public static UserClaimBuilder anUserClaim() {
            return new UserClaimBuilder();
        }

        public UserClaimBuilder withRealName(String realName) {
            this.realName = realName;
            return this;
        }

        public UserClaimBuilder withAuthLatestSequence(String authLatestSequence) {
            this.authLatestSequence = authLatestSequence;
            return this;
        }

        public UserClaimBuilder withEcmId(Long ecmId) {
            this.ecmId = ecmId;
            return this;
        }

        public UserClaimBuilder withPermissionGroupIds(Long[] permissionGroupIds) {
            this.permissionGroupIds = permissionGroupIds;
            return this;
        }

        public UserClaimBuilder withMobile(String mobile) {
            this.mobile = mobile;
            return this;
        }

        public UserClaimBuilder withId(Long id) {
            this.id = id;
            return this;
        }

        public UserClaimBuilder withUserType(Integer userType) {
            this.userType = userType;
            return this;
        }

        public UserClaimBuilder withOrganizationGroupIds(Long[] organizationGroupIds) {
            this.organizationGroupIds = organizationGroupIds;
            return this;
        }

        public UserClaim build() {
            UserClaim userClaim = new UserClaim();
            userClaim.setRealName(realName);
            userClaim.setAuthLatestSequence(authLatestSequence);
            userClaim.setEcmId(ecmId);
            userClaim.setPermissionGroupIds(permissionGroupIds);
            userClaim.setMobile(mobile);
            userClaim.setId(id);
            userClaim.setUserType(userType);
            userClaim.setOrganizationGroupIds(organizationGroupIds);
            return userClaim;
        }
    }
}