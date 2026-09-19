ALTER TABLE `learner_orientation_profiles` ADD COLUMN IF NOT EXISTS `careerFamilyIds` json;--> statement-breakpoint
ALTER TABLE `learner_orientation_profiles` ADD COLUMN IF NOT EXISTS `aspiration` text;
