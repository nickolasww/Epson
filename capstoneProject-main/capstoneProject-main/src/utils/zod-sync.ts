import { ZodType } from "zod";
import { Rule } from "antd/es/form";

type RuleWithField = Rule & { field: string };

export const createZodSync = (schema: ZodType): Rule => {
  return {
    async validator(rule: Rule, value: unknown) {
      const field = (rule as RuleWithField).field;
      const result = await schema.safeParseAsync({ [field]: value });
      if (!result.success) {
        const error = result.error.issues.find((issue) => issue.path[0] === field);
        if (error) {
          throw new Error(error.message);
        }
      }
    },
  };
};