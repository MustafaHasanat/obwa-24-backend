export enum BucketPath {
  USERS = "users", // a directory for images related to each user defined as a sub directory named using the userId
  BUSINESSES = "businesses", // a directory for images related to each business defined as a sub directory named using the businessId
}

export enum BucketFileType {
  // stored in BucketPath.USERS
  USER_AVATAR = "user-avatar", // (updatable)
  REVIEW_ATTACHMENT = "review-attachment", // (NOT updatable)
  // stored in BucketPath.BUSINESSES
  BUSINESS_LOGO = "business-logo", // (updatable)
  BUSINESS_COVER = "business-cover", // (updatable)
  TEAM_MEMBER_IMAGE = "team-member-image", //(updatable)
}
