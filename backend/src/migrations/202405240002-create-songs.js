module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('songs', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      title: {
        type: Sequelize.STRING(200),
        allowNull: false,
      },
      artist: {
        type: Sequelize.STRING(150),
        allowNull: false,
      },
      album_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'albums',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      duration: {
        type: Sequelize.INTEGER,
        allowNull: true,
        comment: 'Duration in seconds',
      },
      cover_url: {
        type: Sequelize.STRING(500),
        allowNull: true,
      },
      audio_url: {
        type: Sequelize.STRING(500),
        allowNull: true,
      },
      youtube_id: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      genre: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      year: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      play_count: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      like_count: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      uploaded_by: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      is_public: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'),
      },
    });

    await queryInterface.addIndex('songs', ['uploaded_by']);
    await queryInterface.addIndex('songs', ['album_id']);
    await queryInterface.addIndex('songs', ['genre']);
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('songs');
  },
};
