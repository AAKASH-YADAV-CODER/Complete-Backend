const asyncHandler = (requestHandler) => {
  return (req, res, next) => {
    Promise.resolve(requestHandler(req, res, next)).catch((err) => next(err));
  };
};

export { asyncHandler };

// const asyncHandler = () => {}
// const asyncHandler = (func) => () => {}
// const asyncHandler = (func) => async () => {}

// const asyncHandler = (fn) => async (req, res, next) => {
//     try {
//         await fn(req, res, next)
//     } catch (error) {
//         res.status(err.code || 500).json({
//             success: false,
//             message: err.message
//         })
//     }
// }

/*

This first parameter create problem after all its not shown in terminal 

const asyncHandler = (requestHandler) => {
  return (err, req, res, next) => {
    Promise.resolve(requestHandler(err, req, res, next)).catch((err) =>
      next(err)
    );
  };
};

export { asyncHandler };


const asyncHandler = (fun) => async (err, req, res, next) => {
    try {
        await fun(err,req,res,next)
    } catch (err) {
        res.status((err.code || 500)).json({
            success: false,
            message:err.message
        })
    }
}
*/
