import type { UserInfo } from 'firebase/auth';
import { Avatar, AvatarFallback, AvatarImage } from '~/core/ui/Avatar';

type ProfileAvatarProps =
  | {
      user: Maybe<UserInfo>;
    }
  | {
      text: Maybe<string>;
    };

const ProfileAvatar: React.FCC<ProfileAvatarProps> = (props) => {
  if ('user' in props && props.user) {
    const initials = getDisplayName(props.user)[0];

    return (
      <Avatar className={'mx-auto w-9 h-9'}>
        <AvatarImage src={props.user.photoURL ?? ''} />
        <AvatarFallback>{initials}</AvatarFallback>
      </Avatar>
    );
  }

  if ('text' in props && props.text) {
    return (
      <Avatar className={'mx-auto w-9 h-9'}>
        <AvatarFallback>{props.text[0]}</AvatarFallback>
      </Avatar>
    );
  }

  return null;
};

function getDisplayName(user: UserInfo) {
  if (user.displayName) {
    return user.displayName;
  }

  return user.email ?? 'Anonymous';
}

export default ProfileAvatar;
