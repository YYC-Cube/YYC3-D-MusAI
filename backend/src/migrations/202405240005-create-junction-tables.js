module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('PlaylistSongs', {
      playlist_id: {
        type: Sequelize.UUID,
        primaryKey: true,
        references: {
          model: 'playlists',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      song_id: {
        type: Sequelize.UUID,
        primaryKey: true,
        references: {
          model: 'songs',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      position: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      added_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    await queryInterface.createTable('UserLikes', {
      user_id: {
        type: Sequelize.UUID,
        primaryKey: true,
        references: {
          model: 'users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      song_id: {
        type: Sequelize.UUID,
        primaryKey: true,
        references: {
          model: 'songs',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      liked_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('PlaylistSongs');
    await queryInterface.dropTable('UserLikes');
  },
};
