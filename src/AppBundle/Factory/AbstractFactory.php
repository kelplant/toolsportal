<?php
namespace AppBundle\Factory;

abstract class AbstractFactory
{
    abstract public function createFromEntity($entityData);

    /**
     * @param array $collection
     * @return array
     */
    public function createFromCollection(array $collection)
    {
        $result = [];

        foreach ($collection as $entityData) {
            $result[] = $this->createFromEntity($entityData);
        }
        return $result;
    }
}