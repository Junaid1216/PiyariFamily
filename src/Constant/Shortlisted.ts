import { ImageSourcePropType } from 'react-native';
import { Images } from '../Assets';

export type ShortlistedProfile = {
  id: string;
  name: string;
  age: number;
  location: string;
  education: string;
  profession: string;
  image: ImageSourcePropType;
  isVerified?: boolean;
};

export const PROFILES_I_LIKED: ShortlistedProfile[] = [
  {
    id: '1',
    name: 'Fatima Khan',
    age: 23,
    location: 'Lahore, Pakistan',
    education: 'MBA',
    profession: 'Software Engineer',
    image: Images.femaleProfile2,
    isVerified: true,
  },
  {
    id: '2',
    name: 'Ayesha Siddiqui',
    age: 26,
    location: 'Islamabad, Pakistan',
    education: 'MBA',
    profession: 'Analyst',
    image: Images.femaleProfile,
  },
  {
    id: '3',
    name: 'Jannat',
    age: 26,
    location: 'Karachi, Pakistan',
    education: 'BS CS',
    profession: 'Content Writer',
    image: Images.femaleProfile2,
    isVerified: true,
  },
];

export const LIKED_ME_PROFILES: ShortlistedProfile[] = [
  {
    id: '4',
    name: 'Sara Ahmed',
    age: 25,
    location: 'Lahore, Pakistan',
    education: 'BBA',
    profession: 'Designer',
    image: Images.femaleProfile,
    isVerified: true,
  },
  {
    id: '5',
    name: 'Rohan Ali',
    age: 29,
    location: 'Karachi, Pakistan',
    education: 'BS CS',
    profession: 'Engineer',
    image: Images.maleProfile,
  },
];
