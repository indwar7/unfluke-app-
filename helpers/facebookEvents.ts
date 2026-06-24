import { AppEventsLogger } from "react-native-fbsdk-next";

// Helper to safely get parameter constants or use fallback string keys
const Params = {
  ContentID: AppEventsLogger.AppEventParams.ContentID || "fb_content_id",
  ContentType: AppEventsLogger.AppEventParams.ContentType || "fb_content_type",
  Currency: AppEventsLogger.AppEventParams.Currency || "fb_currency",
  Success: AppEventsLogger.AppEventParams.Success || "fb_success",
  RegistrationMethod: AppEventsLogger.AppEventParams.RegistrationMethod || "fb_registration_method",
  Level: AppEventsLogger.AppEventParams.Level || "fb_level",
  Description: AppEventsLogger.AppEventParams.Description || "fb_description",
  MaxRatingValue: AppEventsLogger.AppEventParams.MaxRatingValue || "fb_max_rating_value",
};

// Helper to safely get event constants or use fallback string values
const Events = {
  Contact: AppEventsLogger.AppEvents.Contact || "Contact",
  Searched: AppEventsLogger.AppEvents.Searched || "Searched",
  CompletedTutorial: AppEventsLogger.AppEvents.CompletedTutorial || "CompletedTutorial",
  CompletedRegistration: AppEventsLogger.AppEvents.CompletedRegistration || "CompletedRegistration",
  ViewedContent: AppEventsLogger.AppEvents.ViewedContent || "ViewedContent",
  AchievedLevel: AppEventsLogger.AppEvents.AchievedLevel || "AchievedLevel",
  Subscribed: AppEventsLogger.AppEvents.Subscribed || "Subscribe",
  AddedToCart: AppEventsLogger.AppEvents.AddedToCart || "AddedToCart",
  CustomizedProduct: AppEventsLogger.AppEvents.CustomizedProduct || "CustomizedProduct",
  UnlockedAchievement: AppEventsLogger.AppEvents.UnlockedAchievement || "UnlockedAchievement",
  FoundLocation: AppEventsLogger.AppEvents.FoundLocation || "FindLocation",
  SpentCredits: AppEventsLogger.AppEvents.SpentCredits || "SpentCredits",
  Donated: AppEventsLogger.AppEvents.Donated || "Donate",
  AddedToWishlist: AppEventsLogger.AppEvents.AddedToWishlist || "AddedToWishlist",
  InitiatedCheckout: AppEventsLogger.AppEvents.InitiatedCheckout || "InitiatedCheckout",
  StartedTrial: AppEventsLogger.AppEvents.StartedTrial || "StartTrial",
  Scheduled: AppEventsLogger.AppEvents.Scheduled || "Schedule",
  SubmittedApplication: AppEventsLogger.AppEvents.SubmittedApplication || "SubmitApplication",
  Rated: AppEventsLogger.AppEvents.Rated || "Rated",
  AddedPaymentInfo: AppEventsLogger.AppEvents.AddedPaymentInfo || "AddedPaymentInfo",
};

// 1. Contact
export function logContact() {
  try {
    AppEventsLogger.logEvent(Events.Contact);
  } catch (error) {
    console.error("FB Contact logging failed:", error);
  }
}

// 2. Search
export function logSearch(
  contentId: string,
  contentType: string,
  currency: string = "INR",
  valueToSum?: number
) {
  try {
    const params = {
      [Params.ContentID]: contentId,
      [Params.ContentType]: contentType,
      [Params.Currency]: currency,
    };
    AppEventsLogger.logEvent(Events.Searched, valueToSum, params);
  } catch (error) {
    console.error("FB Search logging failed:", error);
  }
}

// 3. Complete tutorial
export function logCompleteTutorial(success: boolean, contentId?: string) {
  try {
    const params: Record<string, any> = {
      [Params.Success]: success ? "1" : "0",
    };
    if (contentId) {
      params[Params.ContentID] = contentId;
    }
    AppEventsLogger.logEvent(Events.CompletedTutorial, undefined, params);
  } catch (error) {
    console.error("FB CompleteTutorial logging failed:", error);
  }
}

// 4. Complete registration
export function logCompleteRegistration(method: string) {
  try {
    AppEventsLogger.logEvent(Events.CompletedRegistration, undefined, {
      [Params.RegistrationMethod]: method,
    });
  } catch (error) {
    console.error("FB CompleteRegistration logging failed:", error);
  }
}

// 5. View content
export function logViewContent(
  contentId: string,
  contentType: string,
  currency: string = "INR",
  valueToSum?: number
) {
  try {
    const params = {
      [Params.ContentID]: contentId,
      [Params.ContentType]: contentType,
      [Params.Currency]: currency,
    };
    AppEventsLogger.logEvent(Events.ViewedContent, valueToSum, params);
  } catch (error) {
    console.error("FB ViewContent logging failed:", error);
  }
}

// 6. Achieve level
export function logAchieveLevel(level: string) {
  try {
    AppEventsLogger.logEvent(Events.AchievedLevel, undefined, {
      [Params.Level]: level,
    });
  } catch (error) {
    console.error("FB AchieveLevel logging failed:", error);
  }
}

// 7. Subscribe
export function logSubscribe() {
  try {
    AppEventsLogger.logEvent(Events.Subscribed);
  } catch (error) {
    console.error("FB Subscribe logging failed:", error);
  }
}

// 8. Add to cart
export function logAddToCart(
  contentId: string,
  contentType: string,
  currency: string = "INR",
  valueToSum?: number
) {
  try {
    const params = {
      [Params.ContentID]: contentId,
      [Params.ContentType]: contentType,
      [Params.Currency]: currency,
    };
    AppEventsLogger.logEvent(Events.AddedToCart, valueToSum, params);
  } catch (error) {
    console.error("FB AddToCart logging failed:", error);
  }
}

// 9. Customise Product
export function logCustomiseProduct() {
  try {
    AppEventsLogger.logEvent(Events.CustomizedProduct);
  } catch (error) {
    console.error("FB CustomiseProduct logging failed:", error);
  }
}

// 10. Unlock achievement
export function logUnlockAchievement(description: string) {
  try {
    AppEventsLogger.logEvent(Events.UnlockedAchievement, undefined, {
      [Params.Description]: description,
    });
  } catch (error) {
    console.error("FB UnlockAchievement logging failed:", error);
  }
}

// 11. Find Location
export function logFindLocation() {
  try {
    AppEventsLogger.logEvent(Events.FoundLocation);
  } catch (error) {
    console.error("FB FindLocation logging failed:", error);
  }
}

// 12. Spend credits
export function logSpendCredits(
  contentId: string,
  contentType: string,
  currency: string = "INR",
  valueToSum?: number
) {
  try {
    const params = {
      [Params.ContentID]: contentId,
      [Params.ContentType]: contentType,
      [Params.Currency]: currency,
    };
    AppEventsLogger.logEvent(Events.SpentCredits, valueToSum, params);
  } catch (error) {
    console.error("FB SpendCredits logging failed:", error);
  }
}

// 13. Donate
export function logDonate() {
  try {
    AppEventsLogger.logEvent(Events.Donated);
  } catch (error) {
    console.error("FB Donate logging failed:", error);
  }
}

// 14. Add to wishlist
export function logAddToWishlist(
  contentId: string,
  contentType: string,
  currency: string = "INR",
  valueToSum?: number
) {
  try {
    const params = {
      [Params.ContentID]: contentId,
      [Params.ContentType]: contentType,
      [Params.Currency]: currency,
    };
    AppEventsLogger.logEvent(Events.AddedToWishlist, valueToSum, params);
  } catch (error) {
    console.error("FB AddToWishlist logging failed:", error);
  }
}

// 15. Initiate checkout
export function logInitiateCheckout(
  contentId: string,
  contentType: string,
  currency: string = "INR",
  valueToSum?: number
) {
  try {
    const params = {
      [Params.ContentID]: contentId,
      [Params.ContentType]: contentType,
      [Params.Currency]: currency,
    };
    AppEventsLogger.logEvent(Events.InitiatedCheckout, valueToSum, params);
  } catch (error) {
    console.error("FB InitiateCheckout logging failed:", error);
  }
}

// 16. Start Trial
export function logStartTrial() {
  try {
    AppEventsLogger.logEvent(Events.StartedTrial);
  } catch (error) {
    console.error("FB StartTrial logging failed:", error);
  }
}

// 17. Schedule
export function logSchedule() {
  try {
    AppEventsLogger.logEvent(Events.Scheduled);
  } catch (error) {
    console.error("FB Schedule logging failed:", error);
  }
}

// 18. Submit Application
export function logSubmitApplication() {
  try {
    AppEventsLogger.logEvent(Events.SubmittedApplication);
  } catch (error) {
    console.error("FB SubmitApplication logging failed:", error);
  }
}

// 19. Rate
export function logRate(
  maxRatingValue: number,
  contentType: string,
  valueToSum?: number
) {
  try {
    const params = {
      [Params.MaxRatingValue]: maxRatingValue,
      [Params.ContentType]: contentType,
    };
    AppEventsLogger.logEvent(Events.Rated, valueToSum, params);
  } catch (error) {
    console.error("FB Rate logging failed:", error);
  }
}

// 20. Purchase
export function logPurchase(
  value: number,
  currency: string = "INR",
  contentId?: string,
  contentType?: string
) {
  try {
    const params: Record<string, any> = {};
    if (contentId) {
      params[Params.ContentID] = contentId;
    }
    if (contentType) {
      params[Params.ContentType] = contentType;
    }
    AppEventsLogger.logPurchase(value, currency, params);
  } catch (error) {
    console.error("FB Purchase logging failed:", error);
  }
}

// 21. Add payment info
export function logAddPaymentInfo(success: boolean) {
  try {
    AppEventsLogger.logEvent(Events.AddedPaymentInfo, undefined, {
      [Params.Success]: success ? "1" : "0",
    });
  } catch (error) {
    console.error("FB AddPaymentInfo logging failed:", error);
  }
}
