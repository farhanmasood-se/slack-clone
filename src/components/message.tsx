import { useUpdateMessage } from '@/features/messages/api/use-update-message';
import { cn } from '@/lib/utils';
import { format, isToday, isYesterday } from 'date-fns';
import dynamic from 'next/dynamic';
import { toast } from 'sonner';
import { Doc, Id } from '../../convex/_generated/dataModel';
import Hint from './hint';
import Renderer from './renderer';
import Thumbnail from './thumbnail';
import Toolbar from './toolbar';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';

const renderer = dynamic(() => import('./renderer'), { ssr: false });
const Editor = dynamic(() => import('./editor'), { ssr: false });

interface MessageProps {
  id: Id<'messages'>;
  memberId: Id<'members'>;
  authorImage?: string;
  authorName?: string;
  isAuthor: boolean;
  reactions?: Array<
    Omit<Doc<'reactions'>, 'memberId'> & {
      count: number;
      memberIds: Id<'members'>[];
    }
  >;
  body: Doc<'messages'>['body'];
  image: string | null | undefined;
  createdAt: Doc<'messages'>['_creationTime'];
  updatedAt: Doc<'messages'>['updatedAt'];
  isEditing: boolean;
  isCompact?: boolean;
  setEditingId: (id: Id<'messages'> | null) => void;
  hideThreadButton?: boolean;
  threadCount?: number;
  threadImage?: string;
  threadTimestamp?: number;
}

const formatFullTime = (date: Date) => {
  return `${
    isToday(date)
      ? 'Today'
      : isYesterday(date)
        ? 'Yesterday'
        : format(date, 'MMM d, yyyy')
  } at ${format(date, 'h:mm:ss a')}`;
};

const Message = ({
  id,
  memberId,
  authorImage,
  authorName = 'Member',
  isAuthor,
  reactions,
  body,
  image,
  createdAt,
  updatedAt,
  isEditing,
  setEditingId,
  isCompact,
  hideThreadButton,
  threadCount,
  threadImage,
  threadTimestamp,
}: MessageProps) => {
  const { mutate: updateMessage, isPending: isUpdatingMessage } =
    useUpdateMessage();

  const isPending = isUpdatingMessage;

  const handleUpdate = ({ body }: { body: string }) => {
    updateMessage(
      { id, body },
      {
        onSuccess: () => {
          toast.success('Message updated');
          setEditingId(null);
        },
        onError: () => {
          toast.error('Failed to update message');
        },
      },
    );
  };

  if (isCompact) {
    return (
      <div
        className={cn(
          'flex flex-col gap-2 p-1.5 px-5 hover:bg-gray-100/60 group relative',
          isEditing && 'bg-[#f2c74433] hover:bg-[#f2c74433]',
        )}
      >
        <div className="flex item-start gap-2">
          <Hint label={formatFullTime(new Date(createdAt))}>
            <button className="text-muted-foreground text-xs opacity-0 group-hover:opacity-100 w-[42.7px] leading-[22px] text-center hover:underline">
              {format(new Date(createdAt), 'hh:mm')}
            </button>
          </Hint>

          {isEditing ? (
            <div className="h-full w-full">
              <Editor
                onSubmit={handleUpdate}
                disabled={isPending}
                defaultValue={JSON.parse(body)}
                onCancel={() => setEditingId(null)}
                variant="update"
              />
            </div>
          ) : (
            <div className="flex flex-col w-full">
              <Renderer value={body} />
              <Thumbnail url={image} />
              {updatedAt ? (
                <span className="text-muted-foreground text-xs">(edited)</span>
              ) : null}
            </div>
          )}
        </div>
        {!isEditing && (
          <Toolbar
            isAuthor={isAuthor}
            isPending={isPending}
            handleEdit={() => setEditingId(id)}
            handleThread={() => {}}
            handleDelete={() => {}}
            handleReaction={() => {}}
            hideThreadButton={hideThreadButton}
          />
        )}
      </div>
    );
  }

  const avatarFallback = authorName.charAt(0).toUpperCase();

  return (
    <div
      className={cn(
        'flex flex-col gap-2 p-1.5 px-5 hover:bg-gray-100/60 group relative',
        isEditing && 'bg-[#f2c74433] hover:bg-[#f2c74433]',
      )}
    >
      <div className="flex items-start gap-2">
        <button onClick={() => {}}>
          <Avatar>
            <AvatarImage src={authorImage} />
            <AvatarFallback>{avatarFallback}</AvatarFallback>
          </Avatar>
        </button>

        {isEditing ? (
          <div className="h-full w-full">
            <Editor
              onSubmit={handleUpdate}
              disabled={isPending}
              defaultValue={JSON.parse(body)}
              onCancel={() => setEditingId(null)}
              variant="update"
            />
          </div>
        ) : (
          <div className="flex flex-col w-full overflow-hidden">
            <div className="text-sm font-medium">
              <button
                onClick={() => {}}
                className="font-bold text-primary hover:underline"
              >
                {authorName}
              </button>
              <span>&nbsp;&nbsp;</span>
              <Hint label={formatFullTime(new Date(createdAt))}>
                <button className="text-muted-foreground text-xs hover:underline">
                  {format(new Date(createdAt), 'h:mm a')}
                </button>
              </Hint>
            </div>
            <Renderer value={body} />
            <Thumbnail url={image} />
            {updatedAt ? (
              <span className="text-muted-foreground text-xs">(edited)</span>
            ) : null}
          </div>
        )}
      </div>
      {!isEditing && (
        <Toolbar
          isAuthor={isAuthor}
          isPending={isPending}
          handleEdit={() => setEditingId(id)}
          handleThread={() => {}}
          handleDelete={() => {}}
          handleReaction={() => {}}
          hideThreadButton={hideThreadButton}
        />
      )}
    </div>
  );
};

export default Message;
