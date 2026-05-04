export const APP_EVENT_VALUES = [
  "LandingPageViewed",
  "OtpRequested",
  "OtpVerified",
  "OnboardingCompleted",
  "HobbyGuideCreated",
  "HobbyGuideViewed",
  "SubtopicViewed",
  "VideoPlayed",
  "HobbyGuideDeleted",
  "ProfileViewed",
  "ProfileUpdated",
  "ToggledTheme",
] as const

export type AppEventType = (typeof APP_EVENT_VALUES)[number]
