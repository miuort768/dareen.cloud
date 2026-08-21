export interface Comment {
    id: string;
    postId: string;
    authorId: string;
    authorName: string;
    authorRole: string;
    content: string;
    created_at: string;
}

export interface Post {
    id: string;
    authorId: string;
    authorName: string;
    authorRole: string;
    content: string;
    status: 'pending' | 'approved' | 'rejected';
    upvotes: string[];
    downvotes: string[];
    commentCount?: number;
    created_at: string;
    comments?: Comment[];
}

type CommentNode = { comment: Comment; replies: CommentNode[] };

export const buildThreadedComments = (comments: Comment[]): CommentNode[] => {
    if (!Array.isArray(comments)) return [];
    const nodes: CommentNode[] = [];
    const handledIds = new Set<string>();

    comments.forEach(c => {
        if (!(c.content || '').trim().startsWith('@')) {
            nodes.push({ comment: c, replies: [] });
            handledIds.add(c.id);
        }
    });

    comments.forEach(c => {
        if (!handledIds.has(c.id)) {
            let foundParent = false;
            for (const node of nodes) {
                if ((c.content || '').trim().startsWith(`@${node.comment.authorName}`)) {
                    node.replies.push({ comment: c, replies: [] });
                    handledIds.add(c.id);
                    foundParent = true;
                    break;
                }
            }
            if (!foundParent) {
                for (const node of nodes) {
                    const isReplyToReply = node.replies.some(r => (c.content || '').trim().startsWith(`@${r.comment.authorName}`));
                    if (isReplyToReply) {
                        node.replies.push({ comment: c, replies: [] });
                        handledIds.add(c.id);
                        foundParent = true;
                        break;
                    }
                }
            }
            if (!foundParent) {
                nodes.push({ comment: c, replies: [] });
                handledIds.add(c.id);
            }
        }
    });
    return nodes;
};
