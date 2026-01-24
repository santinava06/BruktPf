import { sequelize } from '../src/config/database.js';
import ExpenseGroup from '../src/models/ExpenseGroup.js';
import GroupMember from '../src/models/GroupMember.js';

const fixRoles = async () => {
    try {
        await sequelize.authenticate();
        console.log('✅ Connected to database.');

        // Fetch all groups
        const groups = await ExpenseGroup.findAll();
        console.log(`🔍 Found ${groups.length} groups.`);

        for (const group of groups) {
            const creatorId = group.creator_id;
            const groupId = group.id;

            // Find the membership for the creator
            const membership = await GroupMember.findOne({
                where: {
                    group_id: groupId,
                    user_id: creatorId
                }
            });

            if (membership) {
                if (membership.role !== 'admin') {
                    console.log(`⚠️ Updating role for Creator (User ${creatorId}) in Group ${groupId} (${group.nombre}) from '${membership.role}' to 'admin'`);
                    membership.role = 'admin';
                    await membership.save();
                    console.log(`✅ Role updated.`);
                } else {
                    console.log(`ℹ️ Creator (User ${creatorId}) in Group ${groupId} is already admin.`);
                }
            } else {
                console.error(`❌ Creator (User ${creatorId}) is not a member of Group ${groupId}! This is unexpected.`);
                // Optionally create the membership if missing
                await GroupMember.create({
                    group_id: groupId,
                    user_id: creatorId,
                    role: 'admin'
                });
                console.log(`✅ Created missing admin membership for (User ${creatorId}) in Group ${groupId}.`);
            }
        }

        console.log('🎉 Migration completed successfully.');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error during migration:', error);
        process.exit(1);
    }
};

fixRoles();
