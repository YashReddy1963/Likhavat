export function isProfileComplete(profileData) {
    const hasBio = profileData.bio && profileData.bio.trim() !== "";
    const hasProfileImage = profileData.profileImage;
    const hasBannerImage = profileData.bannerImage;
  
    const social = profileData.social || {};
    const hasSocialLink = social.twitter || social.linkedin || social.github;
  
    return hasBio && hasProfileImage && hasBannerImage && hasSocialLink;
}

export default isProfileComplete
