// import type { Recommender, User, AcademicLevel, TargetType, SubjectArea, SearchPreferences } from 'src/types'
// import mockUserData from '../mocks/mockUserData.json'
// import recommenderData from '../mocks/mockRecommenderData.json'
// import { academicLevelOptions, targetTypeOptions, subjectAreaOptions } from 'src/types'

// function castAcademicLevel(val: string): AcademicLevel {
//   return academicLevelOptions.find(opt => opt === val) as AcademicLevel
// }

// function castTargetType(val: string): TargetType {
//   const found = targetTypeOptions.find(opt => opt === val)
//   return found || 'Both'
// }

// function castSubjectAreas(arr: string[]): SubjectArea[] {
//   return arr.filter(val => subjectAreaOptions.includes(val as SubjectArea)) as SubjectArea[]
// }

// class MockService {

//   // Recommender methods
//   async getRecommendersByAuth_user_id(auth_user_id: string): Promise<Recommender[]> {
//     await new Promise(resolve => setTimeout(resolve, 100))
//     const recommenders = recommenderData.recommenders
//       .filter(rec => rec.studentId === auth_user_id)
//       .map(rec => ({
//         recommender_id: rec._id,
//         student_id: rec.studentId,
//         first_name: rec.firstName,
//         last_name: rec.lastName,
//         email_address: rec.emailAddress,
//         phone_number: rec.phoneNumber,
//         relationship: rec.relationship
//       }))
//     return recommenders || []
//   }

//   async getRecommenderById(id: string): Promise<Recommender | null> {
//     await new Promise(resolve => setTimeout(resolve, 100))
//     const recommender = recommenderData.recommenders.find(rec => rec._id === id)
//     if (!recommender) return null
    
//     return {
//       recommender_id: recommender._id,
//       student_id: recommender.studentId,
//       first_name: recommender.firstName,
//       last_name: recommender.lastName,
//       email_address: recommender.emailAddress,
//       phone_number: recommender.phoneNumber,
//       relationship: recommender.relationship
//     }
//   }

//   async createRecommender(auth_user_id: string, recommender: Omit<Recommender, 'recommender_id'>): Promise<Recommender> {
//     await new Promise(resolve => setTimeout(resolve, 100))
//     const existingRec = recommenderData.recommenders.find(rec => rec.emailAddress === recommender.email_address)
    
//     if (existingRec) {
//       const updatedRecommender: Recommender = {
//         recommender_id: existingRec._id,
//         student_id: existingRec.studentId,
//         first_name: recommender.first_name ?? existingRec.firstName,
//         last_name: recommender.last_name ?? existingRec.lastName,
//         relationship: recommender.relationship ?? existingRec.relationship,
//         email_address: recommender.email_address ?? existingRec.emailAddress,
//         phone_number: recommender.phone_number ?? existingRec.phoneNumber
//       }
      
//       return updatedRecommender
//     }
    
//     return {
//       recommender_id: 'new-id-' + Date.now(),
//       student_id: auth_user_id,
//       first_name: recommender.first_name,
//       last_name: recommender.last_name,
//       email_address: recommender.email_address,
//       phone_number: recommender.phone_number,
//       relationship: recommender.relationship
//     }
//   }

//   async updateRecommender(id: string, recommender: Partial<Recommender>): Promise<Recommender> {
//     await new Promise(resolve => setTimeout(resolve, 100))
//     const existingRec = recommenderData.recommenders.find(rec => rec._id === id)
//     if (!existingRec) throw new Error('Recommender not found')
    
//     // Ensure all required fields are present
//     const updatedRecommender: Recommender = {
//       _id: existingRec._id,
//       student_id: existingRec.student_id,
//       first_name: recommender.first_name ?? existingRec.first_name,
//       last_name: recommender.last_name ?? existingRec.last_name,
//       relationship: recommender.relationship ?? existingRec.relationship,
//       email_address: recommender.email_address ?? existingRec.email_address,
//       phone_number: recommender.phone_number ?? existingRec.phone_number
//     }
    
//     return updatedRecommender
//   }

//   async deleteRecommender(id: string): Promise<void> {
//     await new Promise(resolve => setTimeout(resolve, 100))
//     console.log('deleteRecommender', id)
//   }

//   // Essay methods - removed since essays are now nested in applications
//   // Recommendation methods - removed since recommendations are now nested in applications

//   // Profile methods
//   async getProfile(): Promise<{ search_preferences: SearchPreferences }> {
//     await new Promise(resolve => setTimeout(resolve, 100))
//     return {
//       search_preferences: {
//         academic_level: castAcademicLevel(mockUserData.profile.preferences.academicLevel),
//         target_type: castTargetType(mockUserData.profile.preferences.targetType),
//         subject_areas: castSubjectAreas(mockUserData.profile.preferences.subjectAreas),
//         gender: 'Male',
//         ethnicity: 'White/Caucasian',
//         academic_gpa: 3.0,
//         essay_required: false,
//         recommendation_required: false
//       }
//     }
//   }

//   async updateProfile(search_preferences: { search_preferences: SearchPreferences }): Promise<User> {
//     await new Promise(resolve => setTimeout(resolve, 100))
//     return {
//       user_id: mockUserData.userId,
//       auth_user_id: mockUserData.userId,
//       first_name: mockUserData.firstName,
//       last_name: mockUserData.lastName,
//       email_address: mockUserData.emailAddress,
//       phone_number: mockUserData.phoneNumber,
//       search_preferences: search_preferences.search_preferences
//     }
//   }

//   async getUser(): Promise<User> {
//     await new Promise(resolve => setTimeout(resolve, 100))
//     return {
//       user_id: mockUserData.userId,
//       auth_user_id: mockUserData.userId,
//       first_name: mockUserData.firstName,
//       last_name: mockUserData.lastName,
//       email_address: mockUserData.emailAddress,
//       phone_number: mockUserData.phoneNumber,
//       search_preferences: {
//         academic_level: castAcademicLevel(mockUserData.profile.preferences.academicLevel),
//         target_type: castTargetType(mockUserData.profile.preferences.targetType),
//         subject_areas: castSubjectAreas(mockUserData.profile.preferences.subjectAreas),
//         gender: 'Male',
//         ethnicity: 'White/Caucasian',
//         academic_gpa: 3.0,
//         essay_required: false,
//         recommendation_required: false
//       }
//     }
//   }
// }

// export const mockService = new MockService() 