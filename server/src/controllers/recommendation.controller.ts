import { Request, Response } from 'express';
import { getKnex } from '../config/database.config.js';
import { Recommendation } from '../shared-types/recommendation.types.js';

export const getByApplicationId = async (req: Request, res: Response) => {
  try {
    const knex = getKnex();
    const applicationId = Number(req.params.application_id);

    if (Number.isNaN(applicationId)) {
      return res.status(400).json({ message: 'Invalid application ID' });
    }

    const recommendations = await knex<Recommendation>('recommendations')
      .select('*')
      .where({ application_id: applicationId })
      .orderBy('created_at', 'desc');

    res.json(recommendations || []);
  } catch (error) {
    console.error('Error fetching recommendations:', error);
    res.status(500).json({ message: 'Error fetching recommendations', error });
  }
};

export const create = async (req: Request, res: Response) => {
  try {
    const knex = getKnex();
    const recommendationData = req.body as Recommendation;

    if (!recommendationData.application_id || !recommendationData.recommender_id) {
      return res.status(400).json({ message: 'application_id and recommender_id are required' });
    }

    const [recommendationId] = await knex('recommendations')
      .insert({
        application_id: recommendationData.application_id,
        recommender_id: recommendationData.recommender_id,
        due_date: recommendationData.due_date ?? undefined,
        submitted_at: recommendationData.submitted_at ?? undefined,
        status: recommendationData.status
      });

    const newRecommendation = await knex<Recommendation>('recommendations')
      .select('*')
      .where({ recommendation_id: recommendationId })
      .first();

    res.status(201).json(newRecommendation);
  } catch (error) {
    console.error('Error creating recommendation:', error);
    res.status(400).json({ message: 'Error creating recommendation', error });
  }
};

export const update = async (req: Request, res: Response) => {
  try {
    const knex = getKnex();
    const recommendationId = Number(req.params.recommendation_id);

    if (Number.isNaN(recommendationId)) {
      return res.status(400).json({ message: 'Invalid recommendation ID' });
    }

    const {
      recommendation_id: _ignoreRecommendationId,
      application_id: _ignoreApplicationId,
      created_at: _ignoreCreatedAt,
      updated_at: _ignoreUpdatedAt,
      ...updates
    } = req.body as Partial<Recommendation>;

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ message: 'No updatable fields provided' });
    }

    const sanitizedUpdates: Partial<Recommendation> = { ...updates };

    if (Object.prototype.hasOwnProperty.call(sanitizedUpdates, 'due_date')) {
      sanitizedUpdates.due_date = sanitizedUpdates.due_date ?? undefined;
    }

    if (Object.prototype.hasOwnProperty.call(sanitizedUpdates, 'submitted_at')) {
      sanitizedUpdates.submitted_at = sanitizedUpdates.submitted_at ?? undefined;
    }

    const updatedCount = await knex<Recommendation>('recommendations')
      .where({ recommendation_id: recommendationId })
      .update(sanitizedUpdates);

    if (updatedCount === 0) {
      return res.status(404).json({ message: 'Recommendation not found' });
    }

    const updatedRecommendation = await knex<Recommendation>('recommendations')
      .select('*')
      .where({ recommendation_id: recommendationId })
      .first();

    res.json(updatedRecommendation);
  } catch (error) {
    console.error('Error updating recommendation:', error);
    res.status(400).json({ message: 'Error updating recommendation', error });
  }
};

export const deleteRecommendation = async (req: Request, res: Response) => {
  try {
    const knex = getKnex();
    const recommendationId = Number(req.params.recommendation_id);

    if (Number.isNaN(recommendationId)) {
      return res.status(400).json({ message: 'Invalid recommendation ID' });
    }

    const deletedCount = await knex<Recommendation>('recommendations')
      .where({ recommendation_id: recommendationId })
      .del();

    if (deletedCount === 0) {
      return res.status(404).json({ message: 'Recommendation not found' });
    }

    res.json({ message: 'Recommendation deleted successfully' });
  } catch (error) {
    console.error('Error deleting recommendation:', error);
    res.status(500).json({ message: 'Error deleting recommendation', error });
  }
};

