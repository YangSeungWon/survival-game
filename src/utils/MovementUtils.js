export function moveObject(object, facingAngle, moveSpeed, delta) {
    console.log(object.constructor.name, facingAngle, moveSpeed, delta);

    const velocityX = Math.cos(facingAngle) * moveSpeed;
    const velocityY = Math.sin(facingAngle) * moveSpeed;

    object.x += velocityX * delta / 50;
    object.y += velocityY * delta / 50;
}
