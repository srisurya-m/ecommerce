import { User } from "../modals/User.js";
import ErrorHandler from "../utils/utility-class.js";
import { TryCatch } from "./error.js";

//middleware for admin routes only
export const adminOnly = TryCatch(async (req, res, next) => {
  const { id } = req.query; //basically anything written after ?
  if (!id) {
    return next(new ErrorHandler("Please make sure you are logged in", 401));
  }

  const user = await User.findById(id);
  if (!user) {
    return next(new ErrorHandler("Spam user detected", 401));
  }
  if (user.role !=="admin") {
    return next(new ErrorHandler("You are currently unauthorized to proceed", 403));
  }

  next(); //proceeds with the next operation
});
