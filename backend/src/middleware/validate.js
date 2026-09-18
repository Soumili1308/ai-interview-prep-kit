function validate(schema) {
  return (req, res, next) => {
    try {
      const result = schema.safeParse({
        body: req.body,
        params: req.params,
        query: req.query,
      });

      if (!result.success) {
        return res.status(400).json({
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message:
              "Request validation failed.",
            details:
              result.error.issues,
          },
        });
      }

      req.validated = result.data;

      return next();
    } catch (error) {
      next(error);
    }
  };
}

function validateBody(schema) {
  return validate(
    schema instanceof Function
      ? schema
      : {
          safeParse(input) {
            return schema.safeParse(
              input.body
            );
          },
        }
  );
}

module.exports = validate;
module.exports.validate = validate;
module.exports.validateBody = (
  schema
) =>
  (req, res, next) => {
    const result = schema.safeParse(
      req.body
    );

    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message:
            "Request validation failed.",
          details: result.error.issues,
        },
      });
    }

    req.validated = {
      body: result.data,
      params: req.params,
      query: req.query,
    };

    return next();
  };